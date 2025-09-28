# GitHub Repository Visualizer

A modern, interactive web application for visualizing and managing your GitHub repositories with an intuitive interface built using Fomantic UI.

![GitHub Repository Visualizer](https://img.shields.io/badge/GitHub-Repository%20Visualizer-blue?style=for-the-badge&logo=github)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## 🌟 Features

### 📊 Repository Management
- **Complete Repository Overview**: View all your GitHub repositories in an organized, searchable interface
- **Dual View Modes**: Switch between card view and table view for different perspectives
- **Real-time Search**: Find repositories instantly with live search functionality
- **Advanced Filtering**: Filter by language, topics, and other criteria

### 🎯 Smart Sorting & Analysis
- **Multiple Sort Options**:
  - Last Updated
  - Most Stars
  - Most Forks
  - Name (A-Z)
  - License (A-Z)
  - **Need Improvements (Desc)** - Identifies repositories that need attention

### 🏷️ Enhanced Repository Information
- **Rich Metadata Display**:
  - Programming language with color-coded labels
  - License information with visual indicators
  - Topics/hashtags with enhanced styling
  - Star and fork counts
  - Creation and update dates

### 📈 Improvement Score System
- **Intelligent Scoring**: Each repository gets an improvement score based on:
  - Description quality (20 points)
  - Topics/hashtags (5 points per topic)
  - Stars (up to 50 points)
  - Recent updates (30 points for <30 days)
  - Language specification (10 points)
  - License presence (15 points)
  - Forks (up to 20 points)
- **Visual Progress Bars**: See improvement scores with color-coded progress indicators
- **Priority Identification**: Easily spot repositories that need the most attention

### 📋 Export Functionality
- **JSON Export**: Copy JSON data for repositories needing improvements
- **Smart Filtering**: Automatically excludes private repositories
- **Structured Data**: Well-formatted JSON with all relevant repository information
- **Batch Processing Ready**: Perfect for automated repository management scripts

### 🎨 Modern UI/UX
- **Fomantic UI Framework**: Beautiful, responsive design
- **Accessibility Features**: Screen reader support, keyboard navigation, skip links
- **Color-coded Labels**: 
  - 🔵 Blue hashtags/topics
  - 🟢 Green language labels
  - 🟣 Purple license labels
  - 🔴 Red "no license" indicators
- **Interactive Elements**: Hover effects, smooth transitions, modal dialogs

## 🚀 Quick Start

### Prerequisites
- A GitHub Personal Access Token
- Modern web browser with JavaScript enabled

### Installation
1. **Clone or Download** the repository
2. **Open `index.html`** in your web browser
3. **Enter your GitHub token** in the authentication section
4. **Click "Load Repositories"** to start visualizing your repositories

### Getting a GitHub Token
1. Go to [GitHub Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token"
3. Select the `repo` scope (for private repositories) or `public_repo` (for public only)
4. Copy the generated token and paste it into the application

## 📖 Usage Guide

### Basic Operations
1. **Load Repositories**: Enter your GitHub token and click "Load Repositories"
2. **Search**: Use the search bar to find specific repositories
3. **Filter**: Use dropdown filters to narrow down results by language or topic
4. **Sort**: Choose from various sorting options including the unique "Need Improvements" option

### Advanced Features

#### Repository Details Modal
- Click "Details" on any repository to see comprehensive information
- View improvement score with visual progress bar
- See all topics, language, license, and statistics

#### Export Repositories Needing Improvements
1. Click the "Copy JSON" button in the export section
2. The system automatically filters repositories that need:
   - Better descriptions (missing or too short)
   - More hashtags/topics
   - Excludes private repositories
3. Paste the JSON data wherever you need it for further processing

#### Understanding Improvement Scores
- **0-20% (Red)**: Needs significant improvement
- **21-40% (Orange)**: Needs improvement
- **41-60% (Yellow)**: Moderate maintenance
- **61-100% (Green)**: Well maintained

## 🛠️ Technical Details

### Architecture
- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: Fomantic UI (Semantic UI fork)
- **API Integration**: GitHub REST API v3
- **No Backend Required**: Runs entirely in the browser

### File Structure
```
GitHub-Repository-Visualizer/
├── index.html          # Main HTML file
├── script.js          # JavaScript application logic
├── style.css          # Custom CSS styles
└── README.md          # This documentation
```

### Key Functions
- `getUserRepos()`: Fetches repository data from GitHub API
- `calculateImprovementScore()`: Calculates repository improvement scores
- `createRepoTable()`: Generates repository display HTML
- `copyReposNeedingImprovements()`: Exports JSON for repositories needing attention
- `sortRepositories()`: Handles various sorting algorithms

## 🔧 Customization

### Adding New Sort Options
1. Add new option to the sort dropdown in `createRepoTable()`
2. Add corresponding case in `sortRepositories()` function
3. Update the sorting logic as needed

### Modifying Improvement Score Algorithm
Edit the `calculateImprovementScore()` function to adjust:
- Point values for different criteria
- Weight of various factors
- Additional scoring criteria

### Styling Customization
Modify `style.css` to:
- Change color schemes for labels
- Adjust layout and spacing
- Add custom animations
- Modify responsive breakpoints

## 🌐 Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🔒 Security & Privacy

- **Token Security**: Your GitHub token is only used for API calls and never stored
- **No Data Collection**: No user data is collected or transmitted
- **Client-Side Only**: All processing happens in your browser
- **HTTPS Recommended**: Use HTTPS when possible for secure token transmission

## 🤝 Contributing

Contributions are welcome! Here are some ways you can help:

### Bug Reports
- Use clear, descriptive titles
- Include steps to reproduce
- Specify browser and version
- Attach screenshots if applicable

### Feature Requests
- Describe the use case
- Explain the expected behavior
- Consider implementation complexity

### Code Contributions
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Fomantic UI** for the beautiful UI framework
- **GitHub** for the comprehensive API
- **jQuery** for DOM manipulation utilities
- **Contributors** and users who provide feedback

## 📞 Support

If you encounter any issues or have questions:

1. **Check the documentation** above
2. **Search existing issues** on GitHub
3. **Create a new issue** with detailed information
4. **Include browser console errors** if applicable

## 🔮 Future Enhancements

Potential features for future versions:
- Repository comparison tools
- Bulk repository management
- Integration with project management tools
- Advanced analytics and reporting
- Repository health dashboards
- Automated improvement suggestions

---

**Made with ❤️ for the GitHub community**

*Happy coding! 🚀*
