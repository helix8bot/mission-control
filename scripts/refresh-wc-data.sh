#!/bin/bash
###############################################################################
# Refresh WooCommerce data for Mission Control
# Pulls live inventory + sales data from WooCommerce API
# Writes to public/data/inventory.json and public/data/wc-sales.json
###############################################################################

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="$SCRIPT_DIR/../public/data"

# WooCommerce credentials from openclaw env
WC_KEY="${WC_CONSUMER_KEY:-}"
WC_SECRET="${WC_CONSUMER_SECRET:-}"

if [ -z "$WC_KEY" ] || [ -z "$WC_SECRET" ]; then
  # Try loading from openclaw.json
  OPENCLAW_JSON="$HOME/.openclaw/openclaw.json"
  if [ -f "$OPENCLAW_JSON" ]; then
    WC_KEY=$(python3 -c "import json; print(json.load(open('$OPENCLAW_JSON'))['env'].get('WC_CONSUMER_KEY',''))" 2>/dev/null)
    WC_SECRET=$(python3 -c "import json; print(json.load(open('$OPENCLAW_JSON'))['env'].get('WC_CONSUMER_SECRET',''))" 2>/dev/null)
  fi
fi

if [ -z "$WC_KEY" ] || [ -z "$WC_SECRET" ]; then
  echo "ERROR: WooCommerce API keys not found"
  exit 1
fi

BASE_URL="https://elixserpeptides.com/wp-json/wc/v3"
AUTH="-u $WC_KEY:$WC_SECRET"

echo "Refreshing WooCommerce data..."

###############################################################################
# 1. INVENTORY
###############################################################################
echo "  Pulling inventory..."

python3 << PYEOF
import json, subprocess, sys, re
from datetime import datetime

key = "$WC_KEY"
secret = "$WC_SECRET"
base = "$BASE_URL"

r = subprocess.run(
    ['curl', '-s', '-u', f'{key}:{secret}', f'{base}/products?per_page=100'],
    capture_output=True, text=True
)
products = json.loads(r.stdout)

# Clean HTML spans from names
def clean_name(name):
    return re.sub(r'<[^>]+>', '', name).strip()

items = []
for p in products:
    if p.get('status') != 'publish':
        continue
    stock = p.get('stock_quantity')
    stock_status = p.get('stock_status', 'outofstock')
    name = clean_name(p['name'])

    # Calculate days supply based on total_sales and product age
    total_sales = p.get('total_sales', 0)
    daily_rate = total_sales / 90 if total_sales > 0 else 0.67  # default ~1 per 1.5 days
    days_supply = round(stock / daily_rate, 1) if stock and daily_rate > 0 else 0

    if stock is None or stock == 0:
        status = 'critical'
        days_supply = 0
    elif days_supply <= 10:
        status = 'warning'
    elif days_supply <= 30:
        status = 'ok'
    else:
        status = 'healthy'

    items.append({
        'name': name,
        'stock': stock if stock is not None else 0,
        'daysSupply': days_supply,
        'status': status,
        'price': p.get('price', '0'),
        'totalSales': total_sales,
        'wcId': p['id'],
    })

# Sort: critical first, then warning, then by stock ascending
status_order = {'critical': 0, 'warning': 1, 'ok': 2, 'healthy': 3}
items.sort(key=lambda x: (status_order.get(x['status'], 4), x['stock']))

inventory = {
    'lastUpdated': datetime.now().isoformat(),
    'source': 'WooCommerce REST API (live)',
    'items': items,
    'summary': {
        'total': len(items),
        'critical': len([i for i in items if i['status'] == 'critical']),
        'warning': len([i for i in items if i['status'] == 'warning']),
        'ok': len([i for i in items if i['status'] == 'ok']),
        'healthy': len([i for i in items if i['status'] == 'healthy']),
        'totalUnits': sum(i['stock'] for i in items),
    }
}

with open('$DATA_DIR/inventory.json', 'w') as f:
    json.dump(inventory, f, indent=2)

print(f"  Inventory: {len(items)} products, {inventory['summary']['critical']} critical, {inventory['summary']['warning']} warning")
PYEOF

###############################################################################
# 2. SALES DATA
###############################################################################
echo "  Pulling sales data..."

python3 << PYEOF
import json, subprocess, re
from datetime import datetime, timedelta
from collections import defaultdict

key = "$WC_KEY"
secret = "$WC_SECRET"
base = "$BASE_URL"

def clean_name(name):
    return re.sub(r'<[^>]+>', '', name).strip()

def fetch_orders(start, end):
    all_orders = []
    page = 1
    while True:
        url = f'{base}/orders?per_page=100&status=completed&after={start}&before={end}&page={page}'
        r = subprocess.run(['curl', '-s', '-u', f'{key}:{secret}', url], capture_output=True, text=True)
        orders = json.loads(r.stdout)
        if not orders or not isinstance(orders, list):
            break
        all_orders.extend(orders)
        if len(orders) < 100:
            break
        page += 1
    return all_orders

now = datetime.now()
current_month = now.strftime('%Y-%m')
current_month_label = now.strftime('%b')

# Fetch current month orders
month_start = now.replace(day=1).strftime('%Y-%m-%dT00:00:00')
month_end = now.strftime('%Y-%m-%dT23:59:59')
orders = fetch_orders(month_start, month_end)

# Calculate monthly stats
revenue = sum(float(o['total']) for o in orders)
customers = len(set(o.get('billing',{}).get('email','') for o in orders if o.get('billing',{}).get('email')))
aov = revenue / len(orders) if orders else 0

# Daily breakdown for current month
daily = defaultdict(lambda: {'orders': 0, 'revenue': 0.0})
for o in orders:
    day = o['date_created'][:10]
    daily[day]['orders'] += 1
    daily[day]['revenue'] += float(o['total'])

# Top products this month
product_sales = defaultdict(lambda: {'qty': 0, 'revenue': 0.0})
for o in orders:
    for item in o.get('line_items', []):
        name = clean_name(item['name'])
        product_sales[name]['qty'] += item['quantity']
        product_sales[name]['revenue'] += float(item['total'])

top_products = sorted(product_sales.items(), key=lambda x: x[1]['revenue'], reverse=True)

# Last 7 days
seven_days_ago = (now - timedelta(days=7)).strftime('%Y-%m-%dT00:00:00')
recent_orders = [o for o in orders if o['date_created'] >= seven_days_ago.replace('T', ' ').replace('T00:00:00', '')]

# Today's orders
today_str = now.strftime('%Y-%m-%d')
today_orders = [o for o in orders if o['date_created'][:10] == today_str]
today_revenue = sum(float(o['total']) for o in today_orders)

# Build sales JSON
sales_data = {
    'lastUpdated': datetime.now().isoformat(),
    'source': 'WooCommerce REST API (live)',
    'currentMonth': {
        'label': current_month_label,
        'period': current_month,
        'orders': len(orders),
        'revenue': round(revenue, 2),
        'customers': customers,
        'aov': round(aov, 2),
        'daysElapsed': now.day,
    },
    'today': {
        'date': today_str,
        'orders': len(today_orders),
        'revenue': round(today_revenue, 2),
    },
    'dailyBreakdown': {k: v for k, v in sorted(daily.items())},
    'topProducts': [
        {'name': name, 'qty': data['qty'], 'revenue': round(data['revenue'], 2)}
        for name, data in top_products[:10]
    ],
    'note': 'WooCommerce DTC orders only. Does not include B2B or non-WC processor orders.',
}

with open('$DATA_DIR/wc-sales.json', 'w') as f:
    json.dump(sales_data, f, indent=2)

###############################################################################
# REPEAT CUSTOMER ANALYSIS
# Pull all completed orders (last 6 months) to calculate repeat buyer rate
###############################################################################
six_months_ago = (now - timedelta(days=180)).strftime('%Y-%m-%dT00:00:00')
all_orders = fetch_orders(six_months_ago, month_end)

# Group by billing email
customer_orders = defaultdict(list)
for o in all_orders:
    email = o.get('billing', {}).get('email', '').strip().lower()
    if email:
        customer_orders[email].append(o)

total_customers = len(customer_orders)
repeat_customers = len([e for e, ords in customer_orders.items() if len(ords) >= 2])
repeat_pct = round((repeat_customers / total_customers * 100), 1) if total_customers > 0 else 0

# Average orders per repeat customer
repeat_order_counts = [len(ords) for e, ords in customer_orders.items() if len(ords) >= 2]
avg_orders_repeat = round(sum(repeat_order_counts) / len(repeat_order_counts), 1) if repeat_order_counts else 0

# Days between first and last order for repeat customers
repeat_gaps = []
for email, ords in customer_orders.items():
    if len(ords) >= 2:
        dates = sorted([o['date_created'][:10] for o in ords])
        first = datetime.strptime(dates[0], '%Y-%m-%d')
        last = datetime.strptime(dates[-1], '%Y-%m-%d')
        gap = (last - first).days
        if gap > 0:
            repeat_gaps.append(gap)
avg_days_between = round(sum(repeat_gaps) / len(repeat_gaps), 0) if repeat_gaps else 0

sales_data['customerMetrics'] = {
    'totalCustomers6mo': total_customers,
    'repeatCustomers': repeat_customers,
    'repeatPct': repeat_pct,
    'avgOrdersRepeat': avg_orders_repeat,
    'avgDaysBetweenOrders': int(avg_days_between),
    'periodLabel': 'Last 6 months',
}

with open('$DATA_DIR/wc-sales.json', 'w') as f:
    json.dump(sales_data, f, indent=2)

print(f"  Sales: {current_month_label} — {len(orders)} orders, \${revenue:,.2f} revenue, {customers} customers, AOV \${aov:.2f}")
print(f"  Today: {len(today_orders)} orders, \${today_revenue:,.2f}")
print(f"  Customers (6mo): {total_customers} total, {repeat_customers} repeat ({repeat_pct}%), avg {avg_days_between:.0f} days between orders")
PYEOF

echo "Done. Data refreshed at $(date)"
