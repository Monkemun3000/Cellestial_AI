# Cellestial AI

A modern, interactive AI chatbot that uses NASA articles and data to answer questions about space exploration, astronomy, and scientific discoveries.
URL: https://cellestial-ai.web.app/

## Features

- 🤖 **AI-Powered Responses**: Intelligent responses based on NASA's latest articles and data
- 🚀 **Real-time NASA Data**: Integration with NASA APIs including Astronomy Picture of the Day
- 💬 **Modern Chat Interface**: Beautiful, responsive chat UI with message bubbles
- 📰 **Article Integration**: Displays relevant NASA articles with each response
- 🌙 **Dark Mode Support**: Elegant dark/light theme switching
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **API Integration**: Axios for HTTP requests
- **NASA APIs**: Astronomy Picture of the Day, News feeds

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd cellestial-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your NASA API key:
```
NASA_API_KEY=your_nasa_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## NASA API Key

To get a NASA API key:
1. Visit [https://api.nasa.gov/](https://api.nasa.gov/)
2. Fill out the simple form
3. You'll receive your API key via email
4. Add it to your `.env.local` file

## Usage

1. **Ask Questions**: Type any space-related question in the chat input
2. **Get AI Responses**: The chatbot will provide intelligent answers based on NASA data
3. **Explore Articles**: Each response includes relevant NASA articles you can read
4. **Learn More**: Click on article links to read full NASA publications

### Example Questions

- "Tell me about the latest Mars rover discoveries"
- "What has the James Webb telescope found recently?"
- "What's new with the Artemis Moon mission?"
- "Show me today's astronomy picture"
- "What exoplanets have been discovered lately?"

## Project Structure

```
cellestial-ai/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main chat page
├── components/
│   ├── ChatMessage.tsx      # Individual chat message component
│   └── ArticleCard.tsx      # NASA article display component
├── services/
│   └── nasaService.ts       # NASA API integration service
├── public/                  # Static assets
└── ...config files
```

## Customization

### Adding New NASA APIs

1. Add new API endpoints in `services/nasaService.ts`
2. Update the `searchArticles` method to include your new data source
3. Modify the response generation logic as needed

### Styling Changes

- Modify `tailwind.config.js` for theme customization
- Update `app/globals.css` for global styles
- Customize component styles in individual component files

### AI Integration

To integrate with a real AI service (OpenAI, Anthropic, etc.):

1. Install the AI service SDK
2. Replace the `generateResponse` method in `nasaService.ts`
3. Add your API key to environment variables
4. Update the response generation logic

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- NASA for providing amazing APIs and data
- The Next.js team for the excellent framework
- Tailwind CSS for the beautiful styling system
