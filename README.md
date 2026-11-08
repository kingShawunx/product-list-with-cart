# Product List with Cart

A responsive React and Vite dessert shop built with the supplied Frontend Mentor product data, images, icons, and Red Hat Text font. Cart quantities and items are saved in the browser's local storage.

## Run locally

1. Open a terminal in the `product-list-with-cart-main` folder (the folder containing `package.json`).
2. Install the project dependencies:

   ```sh
   npm install
   ```

3. Start the development server:

   ```sh
   npm run dev
   ```

4. Open the local URL printed by Vite, usually `http://localhost:5173`.

To create and preview a production build, run `npm run build` and then `npm run preview`.

## Deploy to Vercel

1. Push this project folder to a GitHub repository.
2. In Vercel, choose **Add New → Project** and import that repository.
3. If the repository contains this project inside a subfolder, set **Root Directory** to `product-list-with-cart-main`.
4. Use the Vite defaults: build command `npm run build` and output directory `dist`.
5. Select **Deploy**. Vercel will build and publish the site; this project has not been deployed yet.

Vite serves the existing `assets` folder during development and copies its images and fonts into the production build. The product catalog remains in the supplied `data.json`.
