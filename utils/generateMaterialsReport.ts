import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export const generateMaterialReport = async ({
  material,
  expected,
  actual,
  variancePercent,
  estimatedLoss
}: any) => {

  const statusColor =
    variancePercent > 10
      ? "red"
      : variancePercent > 5
      ? "orange"
      : "green";

  const statusText =
    variancePercent > 10
      ? "THEFT RISK DETECTED"
      : variancePercent > 5
      ? "SUSPICIOUS USAGE"
      : "NORMAL";

  const html = `
  <html>
    <body style="font-family: Arial; padding: 20px;">
    
      <h1>Material Intelligence Report</h1>
      <h3>Site: Site 1</h3>
      <p>Date: ${new Date().toLocaleString()}</p>

      <hr/>

      <h2>${material.toUpperCase()}</h2>

      <p><b>Expected Usage:</b> ${expected}</p>
      <p><b>Actual Usage:</b> ${actual}</p>

      <p style="color:${statusColor}; font-size:18px;">
        <b>Variance:</b> ${variancePercent.toFixed(2)}%
      </p>

      <h2 style="color:${statusColor}">
        ${statusText}
      </h2>

      <hr/>

      <h3>Estimated Financial Impact</h3>

      <p style="font-size:18px;">
        ₹ ${estimatedLoss.toLocaleString()}
      </p>

      <br/><br/>

      <p>
        This is a system-generated report highlighting potential material leakage 
        based on standard construction ratios.
      </p>

    </body>
  </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });

  await Sharing.shareAsync(uri);
};