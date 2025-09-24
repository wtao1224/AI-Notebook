# Excel Storage System

This notepad application now uses an Excel-compatible storage system instead of a database. Here's how it works:

## Data Storage

- **Location**: All data is stored in your browser's localStorage as JSON
- **Export**: Click the "Export Excel" button to download an Excel file with your data
- **File Name**: `notepad_data.xlsx` will be downloaded to your Downloads folder

## Excel File Structure

The exported Excel file contains two sheets:

### Documents Sheet
- **id**: Unique identifier for each note
- **title**: Note title
- **content**: Full note content
- **tags**: Comma-separated list of tags
- **createdAt**: Creation timestamp
- **updatedAt**: Last update timestamp

### Todos Sheet
- **id**: Unique identifier for each todo
- **title**: Todo item text
- **status**: Current status (pending, in_progress, completed)
- **priority**: Priority level (high, medium, low)
- **createdAt**: Creation timestamp
- **updatedAt**: Last update timestamp

## How to Use

1. **Create Notes**: Use the notepad interface normally
2. **Add Todos**: Click "Show Todo" to open the todo sidebar
3. **Export Data**: Click "Export Excel" to download your data as an Excel file
4. **Backup**: The Excel file serves as a complete backup of your notes and todos

## Data Persistence

- Data is automatically saved to localStorage as you work
- The Excel export provides a portable backup format
- Clearing browser data will remove localStorage, so regular Excel exports are recommended for backup

## Technical Notes

- Uses browser localStorage for persistence
- Excel export uses the xlsx library for file generation
- All timestamps are in ISO format for compatibility