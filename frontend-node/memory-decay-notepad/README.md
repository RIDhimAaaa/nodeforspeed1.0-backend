# Memory Decay Notepad - Integrated Application

A React + Vite application that combines authentication with a memory decay notepad system. Users can sign up, verify their email, and access a protected dashboard for creating and managing notes with automatic decay functionality.

## Features

### Authentication
- **User Registration**: Sign up with email verification
- **User Login**: Secure authentication with JWT tokens
- **Email Verification**: Required for account activation
- **Protected Routes**: All notepad features require authentication
- **User Profile**: Display user information in navigation

### Memory Decay Notepad
- **Dashboard**: View all active notes with countdown timers
- **Create Notes**: Add new notes with custom decay times
- **Archive**: View expired notes that can be revived
- **Revise Notes**: Extend the decay time of existing notes
- **Automatic Expiration**: Notes automatically move to archive when expired

## Technology Stack

- **Frontend**: React 18 + Vite
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **Authentication**: JWT tokens with backend API
- **Backend**: Flask API (deployed on Railway)

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

## Application Flow

1. **Initial Access**: Users land on `/auth` for login/signup
2. **Authentication**: After successful login, users are redirected to `/dashboard`
3. **Protected Features**: All notepad functionality requires authentication
4. **Logout**: Users can logout and return to auth page

## API Integration

The application integrates with the backend API at:
`https://nodeforspeed10-backend-production.up.railway.app/api`

### Key Endpoints Used:
- `POST /auth/signup` - User registration
- `POST /auth/login` - User authentication
- `POST /auth/refresh` - Token refresh
- `POST /auth/resend-verification` - Email verification resend

## File Structure

```
src/
├── components/
│   ├── AuthForms.jsx      # Authentication forms
│   ├── Navigation.jsx     # Main navigation with logout
│   ├── NoteCard.jsx       # Individual note display
│   └── ArchivedNoteCard.jsx # Archived note display
├── pages/
│   ├── Dashboard.jsx      # Main dashboard view
│   ├── NewNote.jsx        # Create new note
│   ├── Archive.jsx        # View archived notes
│   └── Revise.jsx         # Revise existing notes
├── services/
│   └── api.js            # API service for backend communication
├── App.jsx               # Main app with routing and auth
└── main.jsx              # App entry point
```

## Design Features

- **Full-Width Layout**: Optimized for maximum screen usage
- **Responsive Design**: Works on all device sizes
- **Animated Background**: Dynamic orange-themed animations for auth forms
- **Modern UI**: Clean, intuitive interface with smooth transitions
- **Toast Notifications**: User feedback for actions

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Automatic redirection for unauthenticated users
- **Token Management**: Automatic token storage and cleanup
- **Email Verification**: Required account verification process

## Deployment

The application is ready for deployment to platforms like Vercel, Netlify, or any static hosting service. The build process creates optimized production files in the `dist/` directory.

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
