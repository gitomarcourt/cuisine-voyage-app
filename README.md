# Cuisine Voyage

![Cuisine Voyage Logo](assets/logo.png)

## 📱 Description

Cuisine Voyage is a mobile application that takes you on a journey around the world through gastronomy. The app allows you to discover, generate, and save recipes from around the world, while learning about the culinary history of different cultures.

## ✨ Features

- **Custom Recipe Generation**: Create unique recipes based on your available ingredients and culinary preferences
- **Story Mode**: Explore culinary narratives that transport you to different cultures
- **Interactive World Map**: Discover recipes by geographic region
- **Shopping Lists**: Create and manage your shopping lists to prepare your recipes
- **Favorites**: Save your favorite recipes for easy access
- **Smart Suggestions**: The app offers similar recipes that already exist

## 🚀 Installation

### Prerequisites

- Node.js (v18+)
- Expo CLI
- Yarn or npm

### Installing Dependencies

```bash
# Install dependencies
npm install
# or with Yarn
yarn install
```

### Configuration

The application uses Supabase as a backend. Create a `.env` file at the root of the project with the following variables:

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_api_key
```

### Starting the Application

```bash
# Start the application
npm start
# or with Yarn
yarn start
```

Then, scan the QR code with the Expo Go app on your phone or use an emulator.

## 🛠️ Technologies Used

- React Native / Expo
- TypeScript
- Supabase (Database and authentication)
- React Navigation
- Expo AV (for audio)
- React Native Maps
- React Native Reanimated
- React Native Gesture Handler

## 📚 Project Structure

```
cuisine-voyage-app/
├── assets/               # Images, fonts and other resources
├── src/
│   ├── components/       # Reusable components
│   ├── contexts/         # React contexts (Auth, etc.)
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilities and helper functions
│   ├── navigation/       # Navigation configuration
│   ├── screens/          # Application screens
│   ├── services/         # API and external services
│   ├── styles/           # Shared styles
│   └── types/            # TypeScript types
├── App.tsx               # Application entry point
└── package.json          # Project dependencies
```

## 🔄 Workflow

1. Users can explore recipes by region or generate their own recipes
2. Recipe generation is done directly in a bottom sheet, without navigating to another screen
3. The application suggests similar existing recipes when relevant
4. Recipes can be added to favorites and shared
5. Ingredients can be added to a shopping list

## 🔐 Authentication

The application uses Supabase for user authentication, allowing:
- Account creation
- Login via email/password
- Custom profile management

## 📝 Development Notes

- The application uses React Native Reanimated for smooth animations
- The recipe generation system communicates with an external API
- Generated recipes are saved in the Supabase database

## 📱 Compatibility

- iOS 13.0+
- Android 6.0+

## 👥 Contribution

Contributions are welcome! Please follow these steps to contribute:

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

For any questions or suggestions, don't hesitate to contact us! 