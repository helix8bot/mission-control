import { exec } from 'child_process';

export class GoogleSheetData {
  static async fetch(sheetId: string): Promise<{
    cashPosition: string;
    runway: string;
    payablesDue: string;
    inventoryAlerts: string;
    revenueTrends: string;
  }> {
    return new Promise((resolve, reject) => {
      exec(`gog sheets get ${sheetId} "Weekly Snapshot!A1:G53" --json --account helix8bot@gmail.com`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }

        try {
          const weeklyData = JSON.parse(stdout);
          exec(`gog sheets get ${sheetId} "Inventory!A1:H34" --json --account helix8bot@gmail.com`, (error, stdout, stderr) => {
            if (error) {
              reject(error);
              return;
            }

            try {
              const inventoryData = JSON.parse(stdout);
              exec(`gog sheets get ${sheetId} "Monthly P&L!A1:N29" --json --account helix8bot@gmail.com`, (error, stdout, stderr) => {
                if (error) {
                  reject(error);
                  return;
                }

                try {
                  const monthlyData = JSON.parse(stdout);
                  resolve({
                    cashPosition: weeklyData.cashPosition,
                    runway: weeklyData.runway,
                    payablesDue: weeklyData.payablesDue,
                    inventoryAlerts: inventoryData.inventoryAlerts,
                    revenueTrends: monthlyData.revenueTrends,
                  });
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
  }
}