# Koneksi Video Streaming App

A simple web-based video streaming application that uses Koneksi Storage for video storage and streaming.

## Features

- 📤 Upload videos with drag-and-drop or file selection
- 🎥 Stream videos directly from Koneksi Storage
- 📱 Responsive design for desktop and mobile
- 🗑️ Delete videos from the library
- 📊 Display video metadata (size, upload date)
- 🎬 Support for common video formats (MP4, WebM, MOV, AVI, MKV)

## Prerequisites

- Koneksi Storage account with API credentials
- Modern web browser with HTML5 video support
- Web server to host the application (or use local development server)

## Setup

1. Clone this repository:
```bash
git clone https://github.com/yourusername/koneksi-video-streaming.git
cd koneksi-video-streaming
```

2. Update the API configuration in `app.js`:
```javascript
const CONFIG = {
    baseURL: 'https://your-koneksi-instance.com',
    clientID: 'your-client-id',
    clientSecret: 'your-client-secret',
    directoryID: 'your-directory-id'
};
```

3. Serve the application using a web server. For local development:

Using Python:
```bash
python -m http.server 8000
# or for Python 2
python -m SimpleHTTPServer 8000
```

Using Node.js (with http-server):
```bash
npx http-server -p 8000
```

Using PHP:
```bash
php -S localhost:8000
```

4. Open your browser and navigate to `http://localhost:8000`

## Usage

### Uploading Videos

1. Click the upload area or drag and drop a video file
2. Supported formats: MP4, WebM, MOV, AVI, MKV
3. Click "Upload Video" to start the upload
4. Progress will be shown during upload

### Watching Videos

1. Click on any video thumbnail in the library
2. Video will open in a modal player with full controls
3. Click outside the modal or the X button to close

### Deleting Videos

1. Click the "Delete" button under any video
2. Confirm the deletion when prompted

## Configuration

### API Endpoints Used

- List files: `GET /api/clients/v1/directories/{directory_id}`
- Upload file: `POST /api/clients/v1/files?directory_id={directory_id}`
- Download/Stream file: `GET /api/clients/v1/files/{file_id}/download`
- Delete file: `DELETE /api/clients/v1/files/{file_id}`

### Customization

You can customize the appearance by modifying the CSS in `index.html`:

- Change colors by updating the color values
- Adjust grid layout in `.video-grid`
- Modify card styles in `.video-card`

## Security Considerations

⚠️ **Important**: This demo app includes API credentials in the client-side JavaScript. For production use:

1. Implement a backend proxy to handle API authentication
2. Use environment variables for sensitive configuration
3. Implement user authentication and authorization
4. Add CORS configuration on your Koneksi instance
5. Use HTTPS for all communications

## Browser Compatibility

- Chrome 60+
- Firefox 60+
- Safari 11+
- Edge 79+

## Troubleshooting

### Videos not playing
- Check browser console for errors
- Ensure the video format is supported by the browser
- Verify API credentials are correct

### Upload failures
- Check file size limits on your Koneksi instance
- Ensure stable internet connection
- Verify directory permissions

### CORS errors
- Configure CORS on your Koneksi instance to allow your domain
- Use a backend proxy for API calls

## License

MIT License