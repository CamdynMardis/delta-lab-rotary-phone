console.log("loading script file?");

document
  .querySelector("#profileForm")
  .addEventListener("submit", createUserProfile);

async function createUserProfile(e) {
  e.preventDefault();

  // Get user input
  const nameInput = document.querySelector("#nameInput").value;
  const favoriteInput = document.querySelector("#favoriteInput").value;
  const commentInput = document.querySelector("#commentInput").value;

  // Defensive programming
  if (!nameInput.trim() || !favoriteInput) {
    alert("Please enter your name and select a favorite.");
    return;
  }

  // Fetch random dog image
  let dogPicValue;

  try {
    const response = await fetch("https://dog.ceo/api/breeds/image/random");

    if (!response.ok) {
      throw new Error("API request failed");
    }

    dogPicValue = await response.json();

    console.log("dogPicValue ", dogPicValue);
  } catch (error) {
    console.error("Dog API error: ", error);
    alert("Could not load dog picture. Please try again.");
    return;
  }

  // Combine form input and API data
  const userData = {
    name: nameInput,
    favorite: favoriteInput,
    comment: commentInput,
    dogpic: dogPicValue.message,
  };

  console.log("userData object ", userData);

  // Save data to Session Storage
  sessionStorage.setItem("userData", JSON.stringify(userData));

  // Retrieve data from Session Storage
  const savedData = sessionStorage.getItem("userData");
  const parsedData = JSON.parse(savedData);

  console.log("Retrieved user data: ", parsedData);

  // Display saved profile
  displayProfile(parsedData);
}

// Load dropdown options from local JSON
async function loadOptions() {
  try {
    const response = await fetch("assets/data/data.json");

    if (!response.ok) {
      throw new Error("Could not load local JSON");
    }

    const data = await response.json();

    console.log("json data: ", data);

    const favorite = document.querySelector("#favoriteInput");
    let newOption;

    data.forEach((choice) => {
      newOption = new Option(choice.name + " " + choice.emoji, choice.id);

      favorite.appendChild(newOption);
    });
  } catch (error) {
    console.error("JSON loading error: ", error);
  }
}

// Display profile using saved data
function displayProfile(parsedData) {
  const profileOutput = document.querySelector("#profileOutput");

  // Get the selected favorite's display text
  const favoriteSelect = document.querySelector("#favoriteInput");
  const favoriteOption = Array.from(favoriteSelect.options).find(
    (option) => option.value === parsedData.favorite,
  );

  const favoriteName = favoriteOption
    ? favoriteOption.text
    : parsedData.favorite;

  // Clear previous profile
  profileOutput.replaceChildren();

  const heading = document.createElement("h2");
  heading.textContent = parsedData.name + "'s Profile";

  const favorite = document.createElement("p");
  favorite.textContent = "Favorite: " + favoriteName;

  const comment = document.createElement("p");
  comment.textContent = "Comments: " + parsedData.comment;

  const dogImage = document.createElement("img");
  dogImage.src = parsedData.dogpic;
  dogImage.alt = "Random dog";
  dogImage.width = 300;

  profileOutput.append(heading, favorite, comment, dogImage);
}

// Load JSON options when page opens
loadOptions();

// Restore previously saved profile
const savedProfile = sessionStorage.getItem("userData");

if (savedProfile) {
  try {
    const parsedProfile = JSON.parse(savedProfile);

    // Wait until the dropdown options finish loading
    loadSavedProfile(parsedProfile);
  } catch (error) {
    console.error("Could not restore profile: ", error);
  }
}

async function loadSavedProfile(parsedProfile) {
  // Wait for dropdown data to be available
  const favoriteSelect = document.querySelector("#favoriteInput");

  if (favoriteSelect.options.length <= 1) {
    try {
      const response = await fetch("assets/data/data.json");

      if (!response.ok) {
        throw new Error("Could not restore favorites");
      }

      const data = await response.json();

      if (favoriteSelect.options.length <= 1) {
        data.forEach((choice) => {
          favoriteSelect.appendChild(
            new Option(choice.name + " " + choice.emoji, choice.id),
          );
        });
      }
    } catch (error) {
      console.error("Favorite restore error: ", error);
    }
  }

  displayProfile(parsedProfile);
}
