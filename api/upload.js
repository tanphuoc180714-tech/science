import { google } from 'googleapis';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({ multiples: false, keepExtensions: true });
    
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const file = files.image?.[0] || files.image;
    if (!file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
    const mag = Array.isArray(fields.mag) ? fields.mag[0] : fields.mag;
    const desc = Array.isArray(fields.desc) ? fields.desc[0] : fields.desc;
    const date = new Date().toLocaleDateString('vi-VN');

    // Google Auth
    const credentials = {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    if (!credentials.client_email || !credentials.private_key) {
      return res.status(500).json({ error: 'Google credentials are not configured.' });
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    });

    const drive = google.drive({ version: 'v3', auth });
    const sheets = google.sheets({ version: 'v4', auth });

    // 1. Upload to Drive
    const driveRes = await drive.files.create({
      requestBody: {
        name: `${title}-${Date.now()}.${file.originalFilename.split('.').pop()}`,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      },
      media: {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.filepath),
      },
    });

    const fileId = driveRes.data.id;

    // Cấp quyền công khai cho ảnh để hiển thị được trên web
    await drive.permissions.create({
      fileId,
      requestBody: { role: 'reader', type: 'anyone' },
    });

    // Tạo link xem ảnh trực tiếp từ Drive
    const imageUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

    // 2. Ghi dữ liệu vào Sheets
    const sheetId = process.env.GOOGLE_SHEET_ID;
    
    // Lấy tên sheet đầu tiên tự động
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    const sheetName = spreadsheet.data.sheets[0].properties.title;
    const range = `${sheetName}!A:F`;

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          Date.now().toString(),
          date,
          title,
          mag,
          desc,
          imageUrl
        ]],
      },
    });

    res.status(200).json({ success: true, message: 'Upload successful', newImage: {
      id: Date.now().toString(),
      date, title, mag, desc, src: imageUrl
    }});

  } catch (error) {
    console.error('Error during upload:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
}
