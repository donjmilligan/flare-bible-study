# Flare Bible Study - React Version

This is a React-based conversion of the original PHP World Empires in Prophecy visualization. The application provides an interactive hierarchical edge bundling visualization of biblical prophecies and empires.

## Features

- **Interactive Visualization**: D3.js-based hierarchical edge bundling chart showing relationships between biblical empires and prophecies
- **Responsive Design**: Works on desktop and mobile devices
- **Interactive Controls**: Adjustable text size and circle size
- **Tabbed Interface**: Bible texts, About, Settings, and Instructions tabs
- **Modern UI**: Clean, modern interface with Bootstrap styling

## Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

## Installation

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm start
   ```

3. **Open Browser**:
   The application will open automatically at `http://localhost:3000`

## Build for Production

To create a production build:

```bash
npm run build
```

This will create a `build` folder with optimized files ready for deployment.

## Project Structure

```
src/
├── components/
│   ├── Navbar.js              # Navigation bar component
│   ├── Sidebar.js             # Sidebar navigation component
│   ├── WorldEmpiresVisualization.js  # Main D3.js visualization
│   ├── InfoPanel.js           # Right panel with tabs
│   ├── Footer.js              # Footer component
│   └── *.css                  # Component-specific styles
├── App.js                     # Main application component
├── App.css                    # Main application styles
├── index.js                   # React entry point
└── index.css                  # Global styles

public/
├── data/
│   └── studies/
│       └── flare-EmpiresInProphecy.json  # Visualization data
└── index.html                 # HTML template
```

## Key Components

### WorldEmpiresVisualization
- Converts the original D3.js code to React hooks
- Manages the hierarchical edge bundling visualization
- Handles node interactions and data loading

### InfoPanel
- Contains four tabs: Bible Texts, About, Settings, Instructions
- Provides controls for text size and circle size
- Shows information about selected nodes

### Navbar & Sidebar
- Navigation components matching the original design
- Responsive sidebar that collapses on larger screens

## Data Format

The visualization uses JSON data with the following structure:

```json
[
  {
    "name": "flare.empires.bbl.#1 Babylonian",
    "imports": ["flare.desc.Is Run By"]
  },
  {
    "name": "flare.empires.mp.#2 Medo-Persian", 
    "imports": ["flare.desc.Is Run By"]
  }
]
```

Each node represents a biblical empire or concept, and the `imports` array defines relationships to other nodes.

## Customization

### Styling
- Modify component CSS files to change appearance
- Global styles are in `src/index.css` and `src/App.css`

### Data
- Replace `public/data/studies/flare-EmpiresInProphecy.json` with your own data
- Follow the same JSON structure for compatibility

### Visualization
- Adjust D3.js parameters in `WorldEmpiresVisualization.js`
- Modify colors, sizes, and interactions as needed

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Dependencies

- **React**: UI framework
- **D3.js**: Data visualization library
- **Bootstrap**: CSS framework
- **Font Awesome**: Icons

## Original vs React Version

### Improvements in React Version:
- Modern component-based architecture
- Better state management
- Improved performance
- Easier maintenance and updates
- Better development experience

### Preserved Features:
- Same visual appearance
- Same interaction patterns
- Same data structure
- Same functionality

## Troubleshooting

### Common Issues:

1. **D3.js not loading**: Ensure D3.js is properly imported
2. **Data not loading**: Check that the JSON file is in the correct location
3. **Styling issues**: Verify CSS imports are correct

### Development Tips:

- Use browser developer tools to debug
- Check console for error messages
- Verify all dependencies are installed

## License

MIT License - same as the original project

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues or questions, please refer to the original project documentation or create an issue in the repository. 