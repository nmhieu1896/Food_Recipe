import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import Like from "./models/Like";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likeView from "./views/likeView";
import { elements, renderLoader, clearLoader } from "./views/base";

// ------Global state-----
// - Search object
// - Current Recipe
// - Shopping List object
// - liked recipes
// -----------------------
const state = {};

// ------------------ Search Controller-------------
const controlSearch = async () => {
  // Get keyword from UI
  var query = searchView.getInput();

  if (query) {
    // create new search object
    state.search = new Search(query);

    // prepairing for UI
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);

    try {
      // search for recipe
      await state.search.getResults();

      // render recipe on UI
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (error) {
      console.log(error);
      alert("st went wrong with Search!!");
      clearLoader();
    }
  }
};

elements.searchForm.addEventListener("submit", e => {
  e.preventDefault(); // prevent paage from reloading
  controlSearch();
});

elements.searchResPages.addEventListener("click", e => {
  const btn = e.target.closest(".btn-inline");
  if (btn) {
    searchView.clearResults();
    const goalPage = parseInt(btn.dataset.goto);
    searchView.renderResults(state.search.result, goalPage);
  }
});

// ------------------ Recipe Controller-------------

const controlRecipe = async () => {
  const id = window.location.hash.replace("#", "");

  if (id) {
    // prepair for UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);
    console.log('searchView:', searchView);
    // highlight the selected search item
    searchView.highlightSelected(id);

    // create new recipe object
    state.recipe = new Recipe(id);

    try {
      // save recipe to state
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();

      // calculate time and serving
      state.recipe.calcServings();
      state.recipe.calcTime();

      // render recipe
      clearLoader();
      recipeView.renderRecipe(
        state.recipe,
        state.likes ? state.likes.isLiked(id) : false
      );
    } catch (error) {
      console.log(error);
      alert("st went wrong with recipe!!");
    }
  }
};

["hashchange", "load"].forEach(event =>
  window.addEventListener(event, controlRecipe)
);

// ---------------------- List Controller ----------------
const controlList = () => {
  // create new List
  if (!state.list) state.list = new List();

  state.recipe.ingredients.forEach(ingre => {
    const item = state.list.addItem(ingre.count, ingre.unit, ingre.ingredient);
    listView.renderItem(item);
  });
};

// ---------------------- Like Controller --------------------
const controlLike = () => {
  if (!state.likes) state.likes = new Like();
  const currentId = state.recipe.id;

  if (!state.likes.isLiked(currentId)) {
    // Add like to state
    const newLike = state.likes.addLike(
      currentId,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );
    // toggle Like button
    likeView.toggleLikeBtn(true);
    // Add like to UI
    likeView.renderLike(newLike);
  } else {
    // Add like to state
    state.likes.deleteLike(currentId);
    // toggle Like button
    likeView.toggleLikeBtn(false);
    // Add like to UI
    likeView.deleteLike(currentId);
  }
  likeView.toggleLikeMenu(state.likes.getNumberOfLikes());
};

//  Restore liked recipe from localstorage
window.addEventListener("load", () => {
  state.likes = new Like();
  state.likes.getLocalData();
  likeView.toggleLikeMenu(state.likes.getNumberOfLikes());
  state.likes.likes.forEach(like => {
      likeView.renderLike(like);
  })
});

//Handling recipe button click
elements.recipe.addEventListener("click", e => {
  if (e.target.matches(".btn-decrease, .btn-decrease *")) {
    state.recipe.servings > 1 ? state.recipe.updateServings("dec") : null;
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches(".btn-increase, .btn-increase *")) {
    state.recipe.updateServings("inc");
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches(".recipe__btn--add, .recipe__btn--add *")) {
    controlList();
  } else if (e.target.matches(".recipe__love, .recipe__love *")) {
    controlLike();
  }
});

elements.shopping.addEventListener("click", e => {
  const id = e.target.closest(".shopping__item").dataset.itemid; // closest for clicking the children of shopping-item

  if (e.target.matches(".shopping__delete, .shopping__delete *")) {
    state.list.deleteItem(id);
    listView.deleteItem(id);
  } else if (e.target.matches(".shopping__count-value")) {
    const val = parseFloat(e.target.value);
    state.list.updateCount(id, val);
  }
});
