
# Visual Discovery SDK Example

This project demonstrates how to integrate and use the **Fast Simon SDK** for visual product discovery. The example includes features such as uploading an image, searching for products, and handling gallery displays. Follow the steps below to set up and understand the methods used.


## **Project Structure**

### **Main Files**
- `main.html` - Contains the HTML structure.
- `main.css` - Stylesheet for the layout and design.
- `main.js` - Core JavaScript for managing the application state and interacting with the Fast Simon SDK.

### **Utility Files**
- `utils/modal.js` - Handles modal functionality, such as opening and closing modals.

### **Assets**
- **Icons** - SVG icons used for UI components.
- **Styles** - Modular CSS files for modal, spinner, and upload button styling.

---

## **Setup Instructions**

1. **Clone or Download the Project**  
   Download the refactored project ZIP file and extract it to your desired directory.

2. **Install Dependencies (if required)**  
   This example doesn’t require additional dependencies; it uses Fast Simon SDK via a CDN.

3. **Open the Application**  
   Open `main.html` in any modern browser to load the application.

---

## **Fast Simon SDK Integration**

### **SDK Initialization**

The Fast Simon SDK is initialized using the configuration provided in the `window.__fast_simon_sdk_config` object in `main.html`. 

```javascript
window.__fast_simon_sdk_config = {
    store_uuid: "YOUR_STORE_UUID", 
    store_id: YOUR_STORE_ID, 
    type: "SPA", // Specify Single-Page App or Multi-Page App
    onReady: () => {
        console.log("Fast Simon SDK is ready!");
    }
};
```

Replace `YOUR_STORE_UUID` and `YOUR_STORE_ID` with your actual store credentials.

### **Core Methods**

#### **1. Image Search**
This method allows users to upload an image and search for visually similar products.

```javascript
window.FastSimonSDK.visualSearch({
    fileData: file, // File object from the input field
    callback: ({ action, payload }) => {
        if (action === "ImageSearch" && payload.items) {
            stateClient.setState("products", payload.items);
        } else {
            stateClient.setState("products", []);
        }
    }
});
```

#### **2. Products by Discovery**
Fetch products based on a specific discovery mode.

```javascript
window.FastSimonSDK.productsByDiscovery({
    mode: "custom", // Specify discovery mode, e.g., "custom"
    imageID: "IMAGE_ID", // Optional image ID
    callback: ({ action, payload }) => {
        if (action === "ProductsDiscovery" && payload.items) {
            stateClient.setState("gallery", payload.items);
        }
    }
});
```

#### **3. Discovery Images**
Retrieve popular images for discovery purposes.

```javascript
window.FastSimonSDK.discoveryImages({
    mode: "popular", // Specify discovery mode, e.g., "popular"
    callback: ({ action, payload }) => {
        if (action === "DiscoveryImages") {
            stateClient.setState("gallery", payload);
        }
    }
});
```

---

## **Application Flow**

1. **Image Upload**
   - Users can drag and drop an image or use the upload button to provide an input image.

2. **Image Preview**
   - The uploaded image is previewed within the modal.

3. **Product Results**
   - Relevant products are fetched and displayed using the `visualSearch` method.

4. **Gallery View**
   - Products or images from the gallery are displayed using the `productsByDiscovery` or `discoveryImages` methods.

---

## **Extending the Project**

- **Add Custom Features**  
  Extend the `StateClient` class to include additional methods for managing state and handling new functionalities.

- **Style Customization**  
  Modify CSS files in the `assets/style/` directory to customize the UI.

- **Advanced Integrations**  
  Leverage more features of Fast Simon SDK as per [official documentation](https://fastsimon.com/).


