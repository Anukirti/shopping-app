const hamburger = document.getElementById('hamburger');
const sidePanel = document.getElementById('side-panel');
const sidePanelFilters = document.getElementById('side-panel-filters');
const filterBtn = document.getElementById('filter-btn');
const close = document.getElementById('close');
const closeFilter = document.getElementById('closeFilter');
const seeResults = document.getElementById('seeResults');
const API_URL = "https://fakestoreapi.com/products";
const container = document.getElementById("product-container");
const count = document.getElementById("result-count");
const pagination = document.getElementById("pagination");
const sortSelect = document.getElementById("sort");
const categoryFilter = document.querySelectorAll(".filter-checkbox")
const loadMoreBtn = document.getElementById("load-more");
const loadingSpinner = document.getElementById("loading-spinner");
const priceUp = document.getElementById("priceUp");
const priceDown = document.getElementById("priceDown");
const searchBox = document.querySelectorAll(".search-box");
const searchBox2 = document.getElementById("search-box2");
const noResultMessage = document.getElementById("no-results");

let productCount = 0;
let products = [];
let productList =[];
let filteredProducts = [];
const itemsPerPage = 12;
const itemsPerLoad = 10;
let currentPage = 1;
let selectedSort = sortSelect.value;
let debounceTime;
let searchQuery = '';
// for lazy load
let currentIndex =0;

// Toggle Side Panel
hamburger.addEventListener('click', () => {
sidePanel.style.left = sidePanel.style.left === '0px' ? '-250px' : '0px';
overlay.style.display = overlay.style.display === 'block' ? 'none' : 'block';
close.style.display = close.style.display === 'block'?'none':'block';
});
 
filterBtn.addEventListener('click',()=>{
  sidePanelFilters.style.left = sidePanelFilters.style.left === '0px' ? '-250px' : '0px';
overlay2.style.display = overlay2.style.display === 'block' ? 'none' : 'block';
closeFilter.style.display = closeFilter.style.display === 'block'?'none':'block';
})
// Close Side Panel on close icon Click
close.addEventListener('click', () => {
sidePanel.style.left = '-250px';
close.style.display = 'none';
});

closeFilter.addEventListener('click', () => {
  sidePanelFilters.style.left = '-250px';
  closeFilter.style.display = 'none';
  });

seeResults.addEventListener('click', () => {
  sidePanelFilters.style.left = '-250px';
  });

priceUp.addEventListener('click',()=>{
  selectedSort = 'high-low';
  filterAndSortProducts()
})
priceDown.addEventListener('click',()=>{
  selectedSort = 'low-high';
  filterAndSortProducts()
})

sortSelect.addEventListener("change",()=>{
  selectedSort = sortSelect.value;
  filterAndSortProducts()
});
categoryFilter.forEach(checkbox=>
  checkbox.addEventListener("change",filterAndSortProducts));
loadMoreBtn.addEventListener("click",renderProducts);

searchBox.forEach(search=>
  search.addEventListener("input",()=>{
    clearTimeout(debounceTime);
    debounceTime = setTimeout(()=>{
      searchQuery=search.value?.toLowerCase(),
      filterAndSortProducts();
    },500)
  
  })
  );


document.getElementById('clear-all').addEventListener('click',(e)=>{
    e.preventDefault(); // to prevent default link behaviour

    const checkboxes = document.querySelectorAll('#checkbox-group .filter-checkbox');
    //loop to ech checkbox and uncheck
    checkboxes.forEach((checkbox)=>{
        checkbox.checked = false;
    });
    filterAndSortProducts();
    
});

function toggleLoadingSpinner(isLoading){
  if(loadingSpinner.style.display = isLoading){
    loadingSpinner.style.display = "block";
    loadMoreBtn.style.display ="none";
  }else{
    loadingSpinner.style.display = "none";
    loadMoreBtn.style.display ="block";
  }
  
}


async function fetchProducts() {
  toggleLoadingSpinner(true);
    try {
      const response = await fetch(API_URL);
      products = await response.json();
      productList = products
     
      // renderProducts();
      // setupPagination();
      // sortAndRender();
      filterAndSortProducts();
      // Render products in the grid
      
    } catch (error) {
      console.error("Error fetching products:", error);
      container.innerHTML = "<p>Failed to load products. Please try again later.</p>";
    } finally {
      toggleLoadingSpinner(false);
    }
  }

  function renderProducts(){
    // with Pagination
    // const start = (currentPage -1 )* itemsPerPage;
    // const end = start + itemsPerPage;
    // const paginatedProducts = filteredProducts.slice(start,end);

    // container.innerHTML = paginatedProducts
    //     .map(product => {
    //       return `
    //         <div class="product-card">
    //           <img class="product-img" src="${product.image}" alt="${product.title}">
    //           <div class="product-detail">
    //           <p>${product.title.substring(0, 30)}...</p>
    //           <span>$${product.price}</span><br>
    //           <img class="like-icon" src="images/heart_icon.svg" alt="like" >
    //           </div>
              
    //         </div>
    //       `;
    //     //   <p>${product.description.substring(0, 100)}...</p>
    //     })
    //     .join("");

    // With lazy load
    const endIndex = currentIndex + itemsPerLoad;
    const productsToShow = filteredProducts.slice(currentIndex,endIndex);
    productCount = filteredProducts.slice(0,endIndex).length;
    productsToShow.forEach(product=>{
      const productCard = document.createElement("div");
      productCard.classList.add("product-card");
      productCard.innerHTML=`
        <img class="product-img" src="${product.image}" alt="${product.title}">
        <div class="product-detail">
          <p>${product.title.substring(0, 30)}...</p>
          <span>$${product.price}</span><br>
          <img class="like-icon" src="images/heart_icon.svg" alt="like" >
        </div>
      `;
      container.appendChild(productCard);
    });

    currentIndex = endIndex;
    if(currentIndex>= filteredProducts.length){
      loadMoreBtn.disabled = true;
      loadMoreBtn.style.backgroundColor = '#545D63';
    }else{
      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = "Load More";
      loadMoreBtn.style.backgroundColor = '#007bff';
    }
    displayTotal();

  }
function sortProducts(criteria,productsToSort){
  if(criteria === 'low-high'){
    productList = productsToSort.sort((a,b)=> a.price - b.price);
  }else if(criteria === 'high-low'){
    productList = productsToSort.sort((a,b)=>
    b.price - a.price);
  }
  return productList;
}

// function sortAndRender(){
//   container.innerHTML = '';
//   currentIndex = 0;
//   products = sortProducts(sortSelect.value);
//   renderProducts();

// }
// to filter the products based on category.
function filterAndSortProducts(){
  productList = products;
  productList = searchProducts()
  const selectedCategories = Array.from(document.querySelectorAll(".filter-checkbox:checked"))
  .map(el => el.value);
  // const selectedCategories = ["electronics","jewelery"]
  
  filteredProducts = sortProducts(selectedSort,filterProducts(selectedCategories));
  container.innerHTML = '';
  currentIndex = 0;
  renderProducts();

}

function filterProducts(selectedCategories){

  if(selectedCategories.length === 0) {
    return productList;
  }else{
    return productList.filter(product => 
      selectedCategories.includes(product.category.toLowerCase()));
  }

}

function searchProducts(){
  
  if(searchQuery){
    return productList.filter(product =>
      product.title.toLowerCase().includes(searchQuery)||
      product.category.toLowerCase().includes(searchQuery)||
      product.description.toLowerCase().includes(searchQuery));
  }else{
    return productList;
  }
}
// Pagination
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
    seeResults.innerHTML = 'See ' + (productList.length) + ' Results'
    if(productList.length ===0){
      noResultMessage.style.display = 'flex';
      count.style.display ='none';
    }else{
      noResultMessage.style.display = 'none'
      count.style.display ='flex';
      count.innerHTML = 'Showing ' + productCount +' / ' + (productList.length) + ' Results'; 
    }
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