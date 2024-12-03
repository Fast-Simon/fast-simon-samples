class StateClient {

    constructor() {
        this.state = {
            originSiteURL: window.location.origin,
            uploadedImage: null,
            products: [],
            gallery: [],
            resultsVisible: false,
            isLoading: false,
        };
    }

    setState(key, value, additionalValue) {
        this.state[key] = value;
        this.handleStateChange(key, value, additionalValue);
    }

    handleStateChange(key, value, additionalValue) {
        const handlers = {
            uploadedImage: () => this.updateUploadedImage(value, additionalValue),
            products: () => this.updateProducts(value),
            gallery: () => this.updateGallery(value),
            resultsVisible: () => this.toggleResultsVisibility(value),
            isLoading: () => this.toggleLoadingSpinner(value),
        };

        if (handlers[key]) handlers[key]();
    }

    // Function to render the image and overlay dots with bounding boxes
    updateUploadedImage(imageData, additionalValue) {
        const imagePreview = document.getElementById("modal-image-preview");

        // Reset the image preview
        imagePreview.innerHTML = "";

        // Add the image
        const img = document.createElement("img");
        img.src = imageData.url || imageData;
        img.alt = "Uploaded Image";
        img.style.maxWidth = "243px";
        img.style.position = "relative";

        // Append the image to the preview container
        imagePreview.appendChild(img);
        if (additionalValue?.boxes) {
            // Add the dots and bounding boxes
            additionalValue?.boxes.forEach(box => {
                // Dot element
                const dot = document.createElement("div");
                dot.classList.add("dot");
                dot.style.position = "absolute";
                dot.style.left = `${box.dot.x}%`;
                dot.style.top = `${box.dot.y}%`;
                dot.style.transform = "translate(-50%, -50%)";
                dot.style.cursor = "pointer";

                // Add the SVG markup to the dot
                dot.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" class="_productDotIcon_12hr5_185 vd-shop-the-look-dot-icon" style="overflow: visible;">
                <defs>
                    <filter id="dropshadow" x="0" y="0" width="10" height="10">
                        <feOffset result="offOut" in="SourceAlpha" dx="1" dy="1"></feOffset>
                        <feColorMatrix result="matrixOut" in="offOut" type="matrix" values="0.49 0 0 0 0 0 0.49 0 0 0 0 0 0.49 0 0 0 0 0 0.5 0"></feColorMatrix>
                        <feGaussianBlur result="blurOut" in="matrixOut" stdDeviation="2"></feGaussianBlur>
                        <feBlend in="SourceGraphic" in2="blurOut" mode="normal"></feBlend>
                    </filter>
                </defs>
                <g fill="none" fill-rule="evenodd">
                    <g fill="none">
                        <g fill="none">
                            <path d="M0 0L25 0 25 26 0 26z" transform="translate(-378 -128) translate(375 125)"></path>
                            <path fill="white" d="M13.48 3.006l7.385.672c.243.022.435.214.457.457l.672 7.385c.04.448-.12.89-.438 1.209l-8.236 8.236c-1.38 1.38-3.619 1.38-5 0l-4.285-4.286c-1.38-1.38-1.38-3.619 0-5l8.236-8.235c.318-.318.761-.478 1.209-.438zm.554 7.96c.987.986 2.585.986 3.571 0 .987-.987.987-2.585 0-3.571-.986-.987-2.584-.987-3.57 0-.987.986-.987 2.584 0 3.57zm.715-.715c-.592-.591-.592-1.55 0-2.142.591-.592 1.55-.592 2.142 0 .592.591.592 1.55 0 2.142-.591.592-1.55.592-2.142 0z" transform="translate(-378 -128) translate(375 125)" style="filter: url(#dropshadow);"></path>
                        </g>
                    </g>
                </g>
            </svg>
        `;

                // Bounding box element
                const boundingBox = document.createElement("div");
                boundingBox.classList.add("bounding-box");
                boundingBox.style.position = "absolute";
                boundingBox.style.left = `${box.position.left}%`;
                boundingBox.style.top = `${box.position.top}%`;
                boundingBox.style.width = `${box.position.width}%`;
                boundingBox.style.height = `${box.position.height}%`;
                boundingBox.style.border = "2px hidden #00feff";
                boundingBox.style.display = "none";
                boundingBox.style['border-radius'] = "5px";
                boundingBox.style['box-shadow'] = "0 0 0 2000px rgba(0, 0, 0, .5)";

                // Add event listener for dot click
                dot.addEventListener("click", () => {
                    boundingBox.style.display = boundingBox.style.display === "none" ? "block" : "none";
                    stateClient.resetUpload();
                    stateClient.triggerFastSimonSDK(additionalValue?.file, box.name);
                });

                // Append elements
                imagePreview.appendChild(dot);
                imagePreview.appendChild(boundingBox);
            });
        }
    }

// Function to trigger FastSimon SDK
    triggerFastSimonSDK(file, itemName) {
        window.FastSimonSDK.visualSearch({
            fileData: file,
            itemName: itemName,
            callback: ({action, payload}) => {
                if (payload) {
                    stateClient.setState("uploadedImage", payload.imageBase64, {file: file, boxes: payload.bbox});

                    if (action === "ImageSearch" && payload.items) {
                        stateClient.setState("products", payload.items);

                    } else {
                        stateClient.setState("products", []);
                    }
                    stateClient.setState("resultsVisible", true);
                }
            },
        });
    }


    updateProducts(products) {
        this.setState("isLoading", false);
        this.renderList("Search Results", products, false);
    }

    updateGallery(gallery) {
        this.setState("isLoading", false);
        const modalLeftSection = document.getElementById("modal-left-section");
        modalLeftSection.style.display = 'none'

        this.renderList("Gallery", gallery, true);
    }

    toggleResultsVisibility(visible) {
        const resultsSection = document.getElementById("results-section");
        resultsSection.style.display = visible ? "block" : "none";
    }

    toggleLoadingSpinner(isLoading) {
        const spinner = document.getElementById("loading-spinner");
        spinner.classList.toggle("hidden", !isLoading);
    }

    renderList(title, items, isGallery) {
        const modalBody = document.querySelector(".modal-body");
        const modalLeft = document.getElementById("modal-left-section");
        const resultsSection = document.getElementById("results-section");
        const resultsTitle = document.getElementById("results-title");
        const productList = document.getElementById("product-list");
        const backButton = document.getElementById("back-to-gallery");

        productList.innerHTML = items.length
            ? items.map(this.createProductCard).join("")
            : "<p>No products found.</p>";
        if (isGallery) {
            modalBody.classList.toggle("gallery-active", isGallery);
        }

        modalLeft.classList.toggle("hidden", !(Object.keys(items?.[0]).includes('t2')));
        modalLeft.style.display = !(Object.keys(items?.[0]).includes('t2')) ? 'none' : 'block'
        resultsSection.classList.toggle("full-width", !(Object.keys(items?.[0]).includes('t2')));
        backButton.classList.toggle("hidden", !(Object.keys(items?.[0]).includes('t2')));
        resultsTitle.innerText = title;
        if (!(Object.keys(items?.[0]).includes('t2'))) {
            this.attachCardEvents();
        } else {
            this.attachProductsEvents()
        }
    }

    createProductCard(product) {
        const header = !(product.image_id) ? `<h3>${product.l}</h3>` : '';
        const desc = !(product.image_id) ? `<p>${product.p}</p>` : '';
        const img = (product.t) ? `<img src="${product.t}" alt="${product.l ? product.l : 'No Image'}" />` : '';

        return `
            <div class="product" data-image-id="${product.image_id ? product.image_id : product.id}"
            data-product-url="${product.image_id ? '' : product.u}"
            >
                ${img}
                ${header}
                ${desc}
            </div>
        `;
    }

    attachCardEvents() {
        document.querySelectorAll(".product").forEach((card) => {
            card.addEventListener("click", () => {
                const imageId = card.getAttribute("data-image-id");
                const imageSrc = card.querySelector("img").src;
                this.setState("uploadedImage", {url: imageSrc});
                stateClient.resetUpload();
                window.FastSimonSDK.productsByDiscovery({
                    mode: "custom",
                    imageID: imageId,
                    callback: ({action, payload}) => {
                        if (action === "ProductsDiscovery" && payload.items) {
                            this.setState("gallery", payload.items);
                            this.setState("resultsVisible", true);
                        } else {
                            this.setState("gallery", []);
                            this.setState("resultsVisible", true);
                        }
                    },
                });
            });
        });
    }

    resetUpload() {
        const imageUpload = document.getElementById("image-upload");
        imageUpload.value = "";
    }

    initializeBackButton() {
        const backButton = document.getElementById("back-to-gallery");
        backButton.addEventListener("click", () => {
            const modalLeft = document.getElementById("modal-left-section");
            stateClient.resetUpload();
            modalLeft.classList.add("hidden");
            stateClient.discoveryImages();
        });
    }

    initializeApp() {
        this.initializeBackButton();
    }

    discoveryImages() {
        const modalLeft = document.getElementById("modal-left-section");

        modalLeft.style.display = 'none'
        window.FastSimonSDK.discoveryImages({
            mode: "popular",
            callback: ({action, payload}) => {
                const gallery = action === "DiscoveryImages" ? payload : [];
                stateClient.setState("gallery", gallery);
                stateClient.setState("resultsVisible", true);
            },
        });
    }

    attachProductsEvents() {
        document.querySelectorAll(".product").forEach((card) => {
            card.addEventListener("click", () => {
                stateClient.resetUpload();
                const productUrl = `${this.state.originSiteURL}${card.getAttribute("data-product-url")}`;
                window.location.href = productUrl;
            });
        });
    }
}

const stateClient = new StateClient();

document.addEventListener("DOMContentLoaded", () => {
    const imageUpload = document.getElementById("image-upload");
    stateClient.initializeApp();

    imageUpload.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file) return alert("Please upload an image.");
        stateClient.triggerFastSimonSDK(file)
    });

    window.addEventListener("fs-modal-opened", () => {

        stateClient.discoveryImages();
    });
});
