# 🧠 Memory Decay Notepad

A React + Vite application that implements the memory decay principle to help users retain information through spaced repetition and timed reviews.

## ✨ Features

- **📝 Create Notes**: Add notes with customizable decay timers
- **⏰ Automatic Expiration**: Notes automatically expire based on their decay timer
- **🔄 Revision System**: Extend note life by answering review questions
- **📦 Archive Management**: Expired notes are moved to archive for later revival
- **🎨 Beautiful UI**: Clean, responsive design with smooth animations
- **💾 Local Storage**: All data is saved locally in the browser

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd memory-decay-notepad
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📱 Usage

### Creating Notes
1. Click "New Note" or the "+" button
2. Enter a title and content
3. Select a decay timer (5 minutes to 1 day)
4. Click "Create Note"

### Managing Notes
- **Dashboard**: View all active notes sorted by expiration time
- **Quick Extend**: Click "+30m" to extend a note by 30 minutes
- **Revise**: Click "Revise" to answer questions and extend note life

### Archive
- Expired notes automatically move to the archive
- Click "Revive" to bring a note back to active status
- Revived notes get a 30-minute default timer

## 🛠️ Technology Stack

- **Frontend**: React 18 + Vite
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Storage**: Local Storage API

## 📁 Project Structure

```
src/
├── components/
│   ├── Navigation.jsx      # Main navigation bar
│   ├── NoteCard.jsx        # Individual note display
│   └── ArchivedNoteCard.jsx # Archived note display
├── pages/
│   ├── Dashboard.jsx       # Main dashboard view
│   ├── NewNote.jsx         # Create new note form
│   ├── Archive.jsx         # Archived notes view
│   └── Revise.jsx          # Note revision interface
├── App.jsx                 # Main application component
├── App.css                 # Global styles
└── main.jsx               # Application entry point
```

## 🎯 Memory Decay Principle

This application is based on the **spaced repetition** learning technique:

1. **Initial Learning**: Create a note with important information
2. **Timed Review**: Notes expire after a set time to encourage review
3. **Active Recall**: Answer questions to strengthen memory
4. **Spaced Intervals**: Successful reviews extend the note's life
5. **Long-term Retention**: Regular review helps move information to long-term memory

## 🔧 Customization

### Decay Timer Options
- 5 minutes (for quick facts)
- 10 minutes (for short concepts)
- 30 minutes (for medium concepts)
- 1 hour (for detailed topics)
- 1 day (for comprehensive subjects)

### Styling
The app uses Tailwind CSS for styling. You can customize:
- Colors in `tailwind.config.js`
- Component styles in individual files
- Global styles in `App.css`

## 📦 Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by spaced repetition learning techniques
- Built with modern React practices
- Styled with Tailwind CSS for beautiful UI

---

**Happy Learning! 🧠✨**
