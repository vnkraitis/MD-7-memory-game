import axios from "axios";

// Country data type
type Country = {
  name: string;
  code: string;
  capital: string;
  region: string;
  currency: {
    code: string;
    name: string;
    symbol: string;
  };
  language: {
    code: string;
    name: string;
  };
  flag: string;
  dialling_code: string;
  isoCode: string;
};

// Updated type for search parameters to include capital, currency, and language
type SearchParams = {
  name?: string;
  capital?: string;
  currencyName?: string;
  languageName?: string;
};

// Global variables
let countries: Country[] = [];
let startPosition = 0;
const limit = 20;

// Function to update the table with country data
const updateTable = (): void => {
  const tableBody = document.getElementById(
    "countryTableBody",
  ) as HTMLTableSectionElement;
  if (!tableBody) {
    console.error("Table body not found");
    return;
  }

  let allRows = "";
  countries.forEach((country) => {
    const row = `
      <tr>
        <td><img src="https://www.worldatlas.com/r/w425/img/flag/${country.code.toLowerCase()}-flag.jpg" width="50"></td>
        <td>${country.name}</td>
        <td>${country.capital}</td>
        <td>${country.currency.name} (${country.currency.symbol || ""})</td>
        <td>${country.language.name}</td>
      </tr>
    `;
    allRows += row;
  });

  tableBody.innerHTML = allRows;
};

// Function to fetch countries from the API with extended search functionality
const fetchCountries = (searchParams?: SearchParams): void => {
  console.log("Fetching countries...");

  let query = `http://localhost:3004/countries?_sort=name&_order=asc&_start=${startPosition}&_limit=${limit}`;

  if (searchParams?.name) {
    query += `&name_like=${encodeURIComponent(searchParams.name)}`;
  }
  if (searchParams?.capital) {
    query += `&capital_like=${encodeURIComponent(searchParams.capital)}`;
  }
  if (searchParams?.currencyName) {
    query += `&currency.name_like=${encodeURIComponent(
      searchParams.currencyName,
    )}`;
  }
  if (searchParams?.languageName) {
    query += `&language.name_like=${encodeURIComponent(
      searchParams.languageName,
    )}`;
  }

  axios.get(query).then((response) => {
    console.log("Received data:", response.data);
    countries = response.data;
    updateTable();
  });
};

// Event listener for DOMContentLoaded to ensure the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Search button event listener

  const searchButton = document.querySelector(
    ".search-button",
  ) as HTMLButtonElement;
  if (searchButton) {
    searchButton.addEventListener("click", () => {
      startPosition = 0; // Reset the start position for pagination
      countries = []; // Clear the current countries array

      const nameInput = document.getElementById(
        "country-name",
      ) as HTMLInputElement;
      const capitalInput = document.getElementById(
        "country-capital",
      ) as HTMLInputElement;
      const currencyInput = document.getElementById(
        "country-currency",
      ) as HTMLInputElement;
      const languageInput = document.getElementById(
        "country-language",
      ) as HTMLInputElement;

      fetchCountries({
        name: nameInput.value,
        capital: capitalInput.value,
        currencyName: currencyInput.value,
        languageName: languageInput.value,
      });
    });
  } else {
    console.error("Search button not found");
  }

  const loadMoreButton = document.querySelector(
    ".load-more",
  ) as HTMLButtonElement;
  if (loadMoreButton) {
    loadMoreButton.addEventListener("click", () => {
      startPosition += limit; // Increment the start position for pagination
      fetchCountries(); // Fetch the next set of countries
    });
  } else {
    console.error("Load More button not found");
  }

  // Initial fetch of countries on page load
  fetchCountries();
});
