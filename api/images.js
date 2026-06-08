import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const credentials = {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    if (!credentials.client_email || !credentials.private_key) {
      // Nếu chưa cấu hình, trả về mảng rỗng để frontend dùng mock data
      return res.status(200).json([]);
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = process.env.GOOGLE_SHEET_ID;
    
    // Lấy tên sheet đầu tiên tự động
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    const sheetName = spreadsheet.data.sheets[0].properties.title;
    const range = `${sheetName}!A:F`;
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: range,
    });

    const rows = response.data.values || [];
    
    // Bỏ qua dòng tiêu đề nếu dòng đầu không phải là số (ID)
    let startIndex = 0;
    if (rows.length > 0 && isNaN(Number(rows[0][0]))) {
      startIndex = 1;
    }

    const data = rows.slice(startIndex).map(row => {
      return {
        id: row[0] || Date.now().toString(),
        date: row[1] || '',
        title: row[2] || 'Không tên',
        mag: row[3] || '',
        desc: row[4] || '',
        src: row[5] || ''
      };
    });

    // Trả về dữ liệu, đảo ngược để ảnh mới nhất lên đầu
    res.status(200).json(data.reverse());

  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Failed to fetch images', details: error.message });
  }
}
