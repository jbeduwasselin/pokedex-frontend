// Variables gérant le nombre et numéro des Pokémon affichés
const pokemonsPerPage = 28;
let startIndex = 1;
let pokemonsNumber = pokemonsPerPage;

// Fonction qui crée une carte d'affichage de Pokémon
function createPokemonCard(pokemon) {
  const name =
    pokemon.name[0].toUpperCase() + pokemon.name.slice(1).toLowerCase(); // Nom du Pokémon (1ère lettre en majuscule + reste du nom en minuscules)

  const numero = "N° " + pokemon.id.toString().padStart(4, "0"); // Numéro du Pokémon (padStart() permet d'ajouter des 0 pour que le n° ait au moins 4 caractères)

  // Gestion des types
  const type1 = pokemon.types[0].type.name; // 1er type du Pokémon, pour tous les Pokémon
  const type2 = pokemon.types[1] ? pokemon.types[1].type.name : null; // 2nd type du Pokémon, seulement pour les Pokémon à double types
  /* Si le Pokémon a un 2nd type, on le renseigne dans type2, sinon on lui donne null (important car si on ne lui donne pas null il sera undefined et
    ça déclenchera une erreur qui fera que la carte ne sera pas du tout affichée */
  const type2display = type2
    ? `<small class="type">Type 2 : <span>${type2}</span></small>` // Affichage si type2 est true (le Pokémon a un 2nd type)
    : ""; // Affichage si type2 est false (le Pokémon n'a pas de 2nd type)

  const typeClass = type2 ? `type-${type1}-${type2}` : `type-${type1}-monotype`; /* Cette variable donnera la classe HTML correspondant au(x) type(s) du Pokémon.
  C'est utile pour l'affichage des couleurs des Pokémon à 2 types tout en respectant l'ordre "couleur du type 1 (gauche) → (dégradé) → couleur du type 2 (droite)" */
  
  // Création de la carte HTML
  const cardHTML = `
    <div class="pokemon ${typeClass}">
      <div class="starContainer">
        <i class="fa-regular fa-gem shiny" style="font-size: 20px; color: gray; cursor: pointer;"></i>
      </div>
      <div class="imgContainer">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
          pokemon.id
        }.png" alt="${name}" />
      </div>
      <div class="info">
        <h3 class="name">${name}</h3>
        <small class="numero"><span>${numero}</span></small>
        <br>
        <small class="type">Type 1 : <span>${type1}</span></small>
        <br>
        ${type2display}
      </div>
    </div>
  `;

  const container = document.createElement("div"); // Création d'un conteneur pour stocker de l'HTML
  container.innerHTML = cardHTML; // Insertion de la carte créée précédemment dans ce conteneur
  const cardElement = container.firstElementChild; // Création d'une variable qui contient le premier élement enfant du conteneur précédent

  // Fonctionnalité pour alterner avec la version shiny du Pokémon en cliquant sur l'icône shiny
  const shinyIcon = cardElement.querySelector(".shiny"); // Récupère l'icône shiny de la carte
  const imgElement = cardElement.querySelector(".imgContainer img"); // Récupère l'image de la carte
  shinyIcon.addEventListener("click", function () {
    console.log("Click detected on ", this);
    const isShiny = imgElement.src.includes("/shiny/"); // Vérification de si l’image est en version shiny ou non (grâce au nom de l’URL)
    if (isShiny) {
      // Revenir à la version normale
      imgElement.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`; // Image devient la version non shiny
      shinyIcon.style.color = "gray"; // Icône shiny devient grise
    } else {
      // Passer à la version shiny
      imgElement.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemon.id}.png`; // Image devient la version shiny
      shinyIcon.style.color = "gold"; // Icône shiny devient dorée
    }
  });

  // Ajout de la carte complète (carte avec l'icône shiny) dans le conteneur principal
  document.querySelector("#pokemonContainer").appendChild(cardElement);

  /* NB : J'ai procédé ainsi (création et stockage de la carte HTML dans une variable, puis ajout de l'icône et de son évènement, puis ajout du tout dans l'HTML) car
si j'avais créé la carte avec l'icone sans évènement pour l'ajouter hors de la fonction (avec une boucle et "this") ça aurait causé des erreurs liées au temps de chargement
du DOM, et si j'avais simplement utilisé innerHTML pour ajouter la carte à l'HTML pour ensuite ajouter l'évènement de l'icône ça aurait écrasé ce dernier à chaque appel. */
}

// Fonction qui récupère les infos des Pokémon depuis l'API pour en faire des cartes
// NB : J'ai rendu cette fonction asynchrone afin de gérer les promesses, car le fait d'appeler des fetch en parallèle fait que les Pokémon ne sont pas forcément récupérés dans l'ordre
async function fetchPokemons() {
  const fetchPromises = []; // On va stocker chaque fetch (promesse) dans ce tableau

  // Pour chaque Pokémon du n° startIndex (prochain à afficher) au n° pokemonNumber (total de Pokémon affichés)...
  for (let i = startIndex; i <= pokemonsNumber; i++) {
    // ...on stocke la promesse dans une variable...
    const promise = fetch(`https://pokeapi.co/api/v2/pokemon/${i}`).then(
      (res) => res.json()
    );
    fetchPromises.push(promise); // ...et on l'ajoute dans le tableau des promesses
  }

  try {
    const pokemons = await Promise.all(fetchPromises); // On attend que toutes les promesses soient résolues
    /* NB : Promise.all() prend en argument un tableau de promesses
    Si toutes les promesses réussissent, cette méthode renvoie un tableau de résultats (ici stockés dans la variable pokemons) dans le même ordre que les promesses
    Si une promesse échoue, cette méthode renvoie une erreur immédiatement (les autres résultats sont ignorés)
    */
    pokemons.sort((a, b) => a.id - b.id); // On trie les données par ID pour garantir l’ordre
    pokemons.forEach((pokemon) => {
      createPokemonCard(pokemon); // On affiche ainsi chaque Pokémon dans le bon ordre
    });
  } catch (error) {
    console.error("Erreur lors du chargement des Pokémon :", error);
  }
}

// Affichage des Pokémon suivants quand on clique sur Next
document.querySelector("#next").addEventListener("click", function () {
  startIndex += pokemonsPerPage;
  pokemonsNumber += pokemonsPerPage;
  fetchPokemons();
});

// Affichage initial
fetchPokemons();

// Génération dynamique de classes CSS pour tous les doubles types avec un dégradé
function generateTypeStyles() {
  // Couleurs associées à chaque type
  const typeColors = {
    fire: "#f8c5a3",
    grass: "#baffbf",
    electric: "#ffec8c",
    water: "#8ab2e0",
    ground: "#c6c79a",
    rock: "#9b876d",
    fairy: "#f3bfef",
    poison: "#cdb1dd",
    bug: "#c0d394",
    dragon: "#9f88f1",
    psychic: "#cbcc78",
    flying: "#b5ccff",
    fighting: "#ffd49b",
    normal: "#fdecf8",
    ice: "#cbfdff",
    ghost: "#978ca3",
    dark: "#676e69",
    steel: "#999795"
  };

  let styles = ""; // Va contenir de l'HTML et du style

  const types = Object.keys(typeColors); // Object.keys() renvoie un tableau contenant les clés de l'objet spécifié (types contient donc un tableau avec tous les types entrés dans typeColors)

  // Dégradé pour chaque combinaison de double-types (ordre alphabétique pour éviter les doublons inversés)
  for (let i = 0; i < types.length; i++) {
    // Boucle imbriquée pour gérer toutes les combinaisons de 2 types
    for (let j = 0; j < types.length; j++) {
      if (i === j) continue; // Permet d'ignorer les monotypes (type1 et type2 identiques), traités à part

      const type1 = types[i];
      const type2 = types[j];
      const color1 = typeColors[type1];
      const color2 = typeColors[type2];

      styles += `
        .pokemon.type-${type1}-${type2} {
          background-image: linear-gradient(to right, ${color1}, ${color2});
        }
      `;
    }
  }

  // Couleur unie pour les monotypes
  for (const [type, color] of Object.entries(typeColors)) {
    styles += `
      .pokemon.type-${type}-monotype {
        background-color: ${color};
      }
    `;
  }

  // Injection dans le DOM
  const styleTag = document.createElement("style");
  styleTag.textContent = styles;
  document.head.appendChild(styleTag);
}

// Appel au démarrage des couleurs des types
generateTypeStyles();


/* -------- IDÉES D'AMÉLIORATIONS (approx. par ordre d'importance) --------

  - l'icône shiny est presque invisible sur les Pokémon dont le monotype ou le type 2 sont de même couleur qu'elle, voir si je peux ajouter une bordure de couleur différente pour
  garantir son affichage quelque soit la couleur de fond

  - donner la possibilité de choisir le nombre de Pokémon à afficher avec le bouton Next (petit champ d'input à côté du bouton permettant de modifier la valeur de pokemonsPerPage)

  - ajouter un indicateur visuel de chargement des Pokémon (utile si l'utilisateur choisit d'afficher un grand nombre de Pokémon d'un coup)

  - améliorer l'affichage

  - fonction pour afficher un Pokémon spécifique en entrant son nom

  - filtres pour n'afficher que les Pokémon possédant un ou plusieurs type(s) sélectionnés

  - ajouter une anim de scintillement quand on affiche la forme shiny et/ou une anim sur l'icone shiny au clic

  - les Pokémon avec un nom long (à cause d'un nom composé avec la forme du Pokémon, comme "Wormadam-plant" et "Giratina-altered") ont une carte oversized qui perturbe
  la régularité de l'affichage, ce n'est pas si gênant mais voir si je peux améliorer ça (par exemple en réduisant la taille du texte du nom quand celui-ci est trop long)
)

*/
