# Doable - A Minimalist, ADHD-Friendly Planner

<img width="1024" height="1024" alt="icon" src="https://github.com/user-attachments/assets/081a2b5d-34f1-403f-b562-44c93ebbddf1" />


Welcome! This is the codebase for **Doable**, a beautifully simple and intuitive task manager designed from the ground up to be ADHD-friendly. It helps you focus on what's important without the clutter and noise of traditional productivity apps.

---

## ✨ Key Features

* **Clean & Focused Today View:** See your tasks for the day, neatly organized into "To Do" and "Done" sections for a clear sense of accomplishment.
* **Upcoming Timeline View:** A beautiful, timeline-style view of your upcoming schedule, making it easy to visualize your day hour by hour.
* **Focus Mode:** A minimalist Pomodoro timer with a calming, ambient animation to help you concentrate without distractions.
* **AI-Powered Task Breakdown:** Turn large, overwhelming tasks into small, manageable subtasks with a single tap using the power of the Google Gemini API.
* **Streak & Logbook:** Stay motivated by tracking your daily streak and reviewing your completed tasks in a clean, organized Logbook.
* **Minimalist & Themed UI:** A consistent, clean, and light-themed UI that's easy on the eyes and simple to navigate.

---

## 🛠️ Development Resources

This is a **React Native** application, written in **TypeScript**. It's built on a modern stack of community-supported packages.

* **Tech Stack:** A full list of dependencies can be found in the `package.json` file.
* **AI Integration:** The app uses the Google Gemini API for its intelligent features.

---

## 🚀 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/doable-app.git](https://github.com/your-username/doable-app.git)
    ```
2.  **Install dependencies:**
    ```bash
    cd doable-app
    npm install
    ```
3.  **Add your API Key:**
    * Open `src/services/AIService.ts`.
    * Replace `"YOUR_API_KEY_GOES_HERE"` with your actual Google Gemini API key.
4.  **Run on iOS:**
    ```bash
    npx react-native run-ios
    ```
5.  **Run on Android:**
    ```bash
    npx react-native run-android
    ```

---

## 🤝 Contributions

While this is a personal project, I'm open to high-quality contributions. Adhering to the below guidelines will ensure a more timely review.

**Guidelines:**
* Check for existing issues before filing a new one.
* Please open an issue to discuss any significant changes before submitting a pull request.
* Well-written PRs that solve problems concisely are always welcome!

---

## 📜 License (MIT)

The code is available under the MIT license. See the `LICENSE` file for the full license.
