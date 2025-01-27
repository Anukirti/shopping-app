const hamburger = document.getElementById('hamburger');
const sidePanel = document.getElementById('side-panel');
const close = document.getElementById('close');
const API_URL = "https://fakestoreapi.com/products";
const container = document.getElementById("product-container");
const count = document.getElementById("result-count");
const pagination = document.getElementById("pagination");

let products = [];
const itemsPerPage = 12;
let currentPage = 1;

// Toggle Side Panel
hamburger.addEventListener('click', () => {
sidePanel.style.left = sidePanel.style.left === '0px' ? '-250px' : '0px';
overlay.style.display = overlay.style.display === 'block' ? 'none' : 'block';
});
 
// Close Side Panel on close icon Click
close.addEventListener('click', () => {
sidePanel.style.left = '-250px';
close.style.display = 'none';
});

document.getElementById('clear-all').addEventListener('click',(e)=>{
    e.preventDefault(); // to prevent default link behaviour

    const checkboxes = document.querySelectorAll('#checkbox-group .filter-checkbox');
    //loop to ech checkbox and uncheck
    checkboxes.forEach((checkbox)=>{
        checkbox.checked = false;
    });
});
async function fetchProducts() {
    try {
      const response = await fetch(API_URL);
      products = await response.json();
      renderProducts();
      setupPagination();
      displayTotal();
      // Render products in the grid
      
    } catch (error) {
      console.error("Error fetching products:", error);
      container.innerHTML = "<p>Failed to load products. Please try again later.</p>";
    }
  }

  function renderProducts(){
    const start = (currentPage -1 )* itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedProducts = products.slice(start,end);

    container.innerHTML = paginatedProducts
        .map(product => {
          return `
            <div class="product-card">
              <img class="product-img" src="${product.image}" alt="${product.title}">
              <div class="product-detail">
              <p>${product.title.substring(0, 30)}...</p>
              <span>$${product.price}</span><br>
              <img class="like-icon" src="images/heart_icon.svg" alt="like" >
              </div>
              
            </div>
          `;
        //   <p>${product.description.substring(0, 100)}...</p>
        })
        .join("");

  }

  function setupPagination(){
    const totalPages = Math.ceil(products.length / itemsPerPage);
    pagination.innerHTML = "";

    for(let i=1;i<=totalPages;i++){
        const button = document.createElement('button');
        button.textContent = i;
        button.disabled = i === currentPage;
        button.addEventListener("click", ()=>{
            currentPage = i;
            renderProducts();
            setupPagination();
        });
        pagination.appendChild(button);
    }
  }


  function displayTotal(){
    count.innerHTML = (products.length) + ' Results';
  }
 
  // Function to adjust the grid layout based on screen size
  function adjustGridLayout() {
    if (window.innerWidth <= 768) {
      container.classList.remove("desktop-view");
      container.classList.add("mobile-view");
    } else {
      container.classList.remove("mobile-view");
      container.classList.add("desktop-view");
    }
  }
   
  // Add event listener to adjust layout on window resize
  window.addEventListener("resize", adjustGridLayout);
   
  // Initial fetch and layout adjustment
  fetchProducts();
  adjustGridLayout();