import { exec } from 'child_process';

export async function GET(request: Request): Promise<Response> {
  try {
    return new Promise((resolve, reject) => {
      exec(`gog sheets get 1ids5gXnS_KbkOc106JG42AAlCxEYyPiTpQ-wVYiLOx4 "Weekly Snapshot!A1:G53" --json --account helix8bot@gmail.com`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }

        try {
          const weeklyData = JSON.parse(stdout);
          exec(`gog sheets get 1ids5gXnS_KbkOc106JG42AAlCxEYyPiTpQ-wVYiLOx4 "Inventory!A1:H34" --json --account helix8bot@gmail.com`, (error, stdout, stderr) => {
            if (error) {
              reject(error);
              return;
            }

            try {
              const inventoryData = JSON.parse(stdout);
              exec(`gog sheets get 1ids5gXnS_KbkOc106JG42AAlCxEYyPiTpQ-wVYiLOx4 "Monthly P&L!A1:N29" --json --account helix8bot@gmail.com`, (error, stdout, stderr) => {
                if (error) {
                  reject(error);
                  return;
                }

                try {
                  const monthlyData = JSON.parse(stdout);
                  resolve(
                    new Response(JSON.stringify({
                      cashPosition: weeklyData.cashPosition || 'No data',
                      runway: weeklyData.runway || 'No data',
                      payablesDue: weeklyData.payablesDue || 'No data',
                      inventoryAlerts: inventoryData.inventoryAlerts || 'No data',
                      revenueTrends: monthlyData.revenueTrends || 'No data',
                    }), {
                      status: 200,
                      headers: {
                        'Content-Type': 'application/json',
                      },
                    })
                  );
                } catch (e) {
                  reject(e);
                }
              });
            } catch (e) {
              reject(e);
            }
          });
        } catch (e) {
          reject(e);
        }
      });
    });
  } catch (error) {
    return new Response(JSON.stringify({
      cashPosition: 'No data',
      runway: 'No data',
      payablesDue: 'No data',
      inventoryAlerts: 'No data',
      revenueTrends: 'No data',
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}