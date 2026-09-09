# Study Hub Plus

Semester 3


Semester 4


IT


Semester 1


Semester 2


Semester 3


Semester 4


Semester 5


Semester 6


Each semester contains its subjects, and every subject has:


Notes


PYQs


Practicals


8. Bookmark Feature


Keep the bookmark feature.


Students should be able to bookmark any PDF.


Bookmarks should be saved in the browser's Local Storage so they remain available after closing and reopening the website on the same device.


9. Responsive Design


The website must work perfectly on:


Desktop


Laptop


Tablet


Mobile


10. Backend Storage


Implement a real backend for file storage instead of storing files only in the browser.


Requirements:


Store uploaded PDFs permanently.


Uploaded files should be visible to every visitor.


Use a backend such as Firebase Storage, Supabase Storage, Appwrite, or another persistent cloud storage solution.


Save file metadata (file name, category, semester, subject, upload date, size, and download URL) in a database.


Automatically display uploaded files after fetching them from the backend.


11. Final Result


When someone opens the website:


No login page appears.


Home page opens directly.


Upload buttons are available for Notes, PYQs, and Practicals.


Clicking Upload opens the computer's file picker.


Uploaded PDFs are permanently stored.


Every uploaded PDF has View and Download buttons.


Search works across all uploaded files.


Bookmarks are saved in the user's browser.


The website remains clean, modern, fast, and responsive without changing the existing design.Update my existing College Notes website. Do NOT create a new project. Modify the current project with the following changes.


=========================================


1. REMOVE LOGIN SYSTEM


=========================================


- Remove the Login button completely.


- Remove any login page.


- Remove authentication.


- As soon as the website opens, users should directly reach the Home Dashboard.


=========================================


2. HOME PAGE


=========================================


Keep the existing modern UI.


Dashboard should include:


- Welcome Message


- College Logo on the left


- College Campus image as background with dark overlay


- Search Bar


- Categories


Categories:


- BCA


- MCA


- IT


=========================================


3. WORKING PDF SYSTEM


=========================================


The Upload button must actually work.


When Admin clicks Upload:


1. Open the computer's file picker.


2. Allow only PDF files.


3. Upload the PDF.


4. Save the uploaded file.


5. Display the uploaded PDF immediately.


6. Students can:


   - View PDF


   - Download PDF


Every upload section must contain:


Upload PDF


View PDF


Download PDF


These buttons must actually function.


=========================================


4. BOOKMARK FEATURE


=========================================


Add a Bookmark feature.


Every PDF should have a Bookmark button.


When a student bookmarks a PDF:


- Save bookmark in browser LocalStorage.


- Bookmark should remain after refreshing.


- Add a "Bookmarks" page.


- Students can open bookmarked PDFs anytime.
i want website from given data and add the logo on the left side of the website and add the collage campus photo on the background full working website with upload button and the dowload should also work

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/893de972-fabb-4145-b246-bc3877c619c8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
