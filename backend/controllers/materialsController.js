const db = require('../db');

// Add Material Log
exports.log = async (req, res) => {
  const { material, quantityUsed, unit, areaCompleted, notes, createdBy } = req.body;
  if (!material || !quantityUsed || !areaCompleted) {
    return res.status(400).json({ error: 'Missing required material parameters' });
  }

  try {
    const result = await db.query(
      `INSERT INTO material_logs (material, quantity_used, unit, area_completed, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, material, quantity_used as "quantityUsed"`,
      [material, parseFloat(quantityUsed), unit || 'bags', parseFloat(areaCompleted), notes || '', createdBy]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Generate Audit Report
exports.report = async (req, res) => {
  try {
    // 1. Fetch all material logs
    const logsResult = await db.query('SELECT * FROM material_logs');
    
    // 2. Fetch standard cement ratio
    const standardResult = await db.query("SELECT ratio FROM material_standards WHERE id = 'cement'");
    const cementRatio = standardResult.rows.length > 0 ? parseFloat(standardResult.rows[0].ratio) : 0.05;

    let totalArea = 0;
    let cementUsed = 0;

    logsResult.rows.forEach(row => {
      totalArea += parseFloat(row.area_completed || 0);
      if (row.material && row.material.toLowerCase().includes('cement')) {
        cementUsed += parseFloat(row.quantity_used || 0);
      }
    });

    if (totalArea === 0) {
      return res.json({ totalArea: 0, cementUsed: 0, expected: 0, variance: 0, extra: 0, status: 'No Data', statusColor: 'gray' });
    }

    const expected = totalArea * cementRatio;
    const variance = ((cementUsed - expected) / expected) * 100;

    let status = 'Normal ✅';
    let statusColor = 'green';

    if (variance > 12) {
      status = 'Possible Theft 🚨';
      statusColor = 'red';
    } else if (variance > 5) {
      status = 'Needs Inspection ⚠️';
      statusColor = '#f59e0b';
    }

    res.json({
      totalArea,
      cementUsed,
      expected,
      variance,
      extra: cementUsed - expected,
      status,
      statusColor
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
