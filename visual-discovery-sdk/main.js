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

    setState(key, value) {
        this.state[key] = value;
        this.handleStateChange(key, value);
    }

    handleStateChange(key, value) {
        const handlers = {
            uploadedImage: () => this.updateUploadedImage(value),
            products: () => this.updateProducts(value),
            gallery: () => this.updateGallery(value),
            resultsVisible: () => this.toggleResultsVisibility(value),
            isLoading: () => this.toggleLoadingSpinner(value),
        };

        if (handlers[key]) handlers[key]();
    }

    updateUploadedImage(imageData) {
        const imagePreview = document.getElementById("modal-image-preview");

        this.setState("isLoading", true);

        if (imageData) {
            const url = imageData.url || imageData;
            imagePreview.innerHTML = `<img src="${url}" alt="Uploaded Image" style="max-width: 243px;">`;
            imagePreview.classList.remove("hidden");
        } else {
            imagePreview.innerHTML = "";
            imagePreview.classList.add("hidden");


        }
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

    initializeBackButton() {
        const backButton = document.getElementById("back-to-gallery");
        backButton.addEventListener("click", () => {
            const modalLeft = document.getElementById("modal-left-section");

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
        window.FastSimonSDK.visualSearch({
            fileData: file,
            callback: ({action, payload}) => {
                stateClient.setState("uploadedImage", payload.imageBase64);
                if (action === "ImageSearch" && payload.items) {
                    stateClient.setState("products", payload.items);
                } else {
                    stateClient.setState("products", []);
                }
                stateClient.setState("resultsVisible", true);
            },
        });
    });

    window.addEventListener("fs-modal-opened", () => {

        stateClient.discoveryImages();
    });
});
