# Le guide du voyageur intercomposant

## Menu

- [Introduction](#introduction)
- [L'idée](#lid%C3%A9e)
- [Le core](#le-core)
  - [Les constantes](#les-constantes)
  - [Les actions](#les-actions)
  - [Les reducers](#les-reducers)
  - [Les sagas](#les-sagas)
- [Les composants](#les-composants)
- [Les routes](#les-routes)

## Introduction

Bienvenue à toi, jeune padawan ! Afin de te guider dans ton parcours pour réussir à développer quelque chose de propre, je serai ton guide dans cette aventure qui sera, j'en suis sûr, inoubliable.

Il est important de noter plusieurs règles qui ont régi l'écriture de ce guide :

- Prends le temps de tout lire, même si ça te semble long et trop verbeux.
- Si quelque chose ne te semble pas clair, mais s'éclaircit plus tard, n'oublie pas de faire une MR afin de faire profiter aux autres de ton incroyable capacité à lire et comprendre plus vite.
- Si en revanche, tu n'es pas d'accord avec l'un des principes, n'hésite pas à m'en faire part

Une fois tout ceci en tête, il est temps de commencer ! Je te sens frétiller comme un poisson en manque de coke, alors allons-y.

## L'idée

Pour commencer, nous allons utiliser un exemple qui va parler à toutes les applications : la fameuse fonctionnalité de la TODO LIST

> Ouais mais moi je m'en fous, c'est pas ça que je suis en train de faire

Certes, cher lecteur, mais tout est dans l'exemple. Soit patient, prends une madeleine et détends-toi.
Essayons d'abord de détailler la feature afin qu'on soit d'accord (m'enfin, je m'en fous, c'est moi qui impose les règles sur le coup).

Cette feature se décompose en deux parties :

- La création d'une page qui va venir fetch les TODO
- l'appel en lui-même et le rafraichissement de la page avec les TODOs fraichement récupérées

Rien de bien sorcier, mais on notera ici, de manière un peu plus technique, qu'il y aura donc un container, relié à un reducer, dans le même dossier.

> L'idée ici est de regrouper les différents composants/containers par _feature_. C'est vraiment important de garder ça en tête lors de la création d'un nouveau dossier.

Dans notre cas, la structure devra donc ressembler à ça :

```
/app/containers
├── App
├── HomePage <---- Le container, ou plutôt dans notre cas : la feature
│   ├── Loadable.js <---- LazyComponent (https://fr.reactjs.org/docs/code-splitting.html#reactlazy)
│   ├── assets <---- L'ensemble des fichiers liés aux styles (images / styles)
│   │   └── styles.scss
│   ├── core <---- L'ensemble des fichiers liés à la logique métier
│   │   ├── actionTypes.js
│   │   ├── actions.js
│   │   ├── messages.js
│   │   ├── reducer.js
│   │   └── saga.js
│   └── index.js <---- Le container principal
├── LanguageProvider
└── NotFoundPage
```

Concernant les états possibles, il y en a trois :

- Lorsque j'arrive sur la page, je dois être en état "loading"
- Lorsque mes todos sont chargés, je suis en état "success"
- Lorsque mes todos sont en erreur, je suis en état "failed"

## Le core

Ok, c'est bon, t'as bien compris la structure (enfantine) d'une feature, et tu sens prêt à _kick ass_ tout ce qui se trouve à 30 pixels autour de toi.
Je te conseille donc de commencer par cette partie pour poser les différentes structures de données qui seront utilisée.

### Les actionTypes

Je commence par celles-ci, car elles sont la pierre angulaire de toute la partie core. Les `actions`, `reducers`, `sagas` _and so on_ en dépendent.

J'ai choisi de baser les actionTypes sur l'ensembles des actions possibles sur le site. Juste au dessus, vu que tu as bien lu, on en a défini une.

Ainsi, le code des actionTypes serait le suivant :

```js
import { setActionTypes } from "@kai23/reduxutils";

const prefixes = ["GET_TODOS"];

const actionTypes = setActionTypes(prefixes, "home", "application-example");

export default actionTypes;
```

Ici, le code est minimsé, mais dis-toi qu'il va, en gros, nous générer les actionTypes suivantes :

```js
{
  "GET_TODOS_LOADING": "application-example:home:getTodos:loading",
  "GET_TODOS_SUCCESS": "application-example:home:getTodos:success",
  "GET_TODOS_FAILED": "application-example:home:getTodos:failed"
}
```

Les actionTypes sont donc partagées en trois blocs :

- LOADING : l'action en cours
- SUCCESS : l'action est finie, et a réussie
- FAILED : l'action est finie, mais a échoué

> Pourquoi t'as mis `SUCCESS` alors que tous les autres sont des verbes conjugués

Ce fut un long débat, mais on s'est dit que ce serait sûrement plus simple d'avoir `SUCCESS` que `SUCCEEDED`, et que ça parlait à tout le monde

Pour revenir au sujet, chacune des actionTypes générées se décomposent elles-même en quatre blocs, séparés par des `:` :

- l'app (ici, `application-example`)
- le nom de la feature, en camelCase (ici, `home`)
- l'action en cours (`getTodos`)
- le statut de l'action

> Ouais mais si je veux rajouter mon actionType à moi ?

Ben je suis sûr que tu as déjà entendu parlé de `Object.assign`, ou même ajouté toi-même des clefs dans un objet. Si ce n'est pas le cas, merci de fermer ce guide, d'éteindre ton ordinateur et d'aller pleurer dans un coin jusqu'à ce que la mer de larme qui s'est formée autour de toi te permette de t'y noyer, et de le faire.

Attention tout de même, l'idée de générer les actionTypes était, au dela de ne plus avoir de code à écrire, surtout pour garder une même convention tout le long du projet.

### Les actions

Les actions peuvent être considérées comme ayant deux rôle distincts :

- Un rôle de dispatcheur d'event
- Un rôle d'event listener.

Les actions permettent donc de faire changer l'état de notre application, en transmettant parfois des informations en paramètres.
Une fois ces informations sous la manche, nous allons également les générer, comme les actionTypes.
Voici le code qui permettra de créer les actions :

```js
import { setActions } from "@kai23/reduxutils";
import actionTypes from "./actionTypes";

const actionParams = {
  GET_TODOS_SUCCESS: ["result"]
};

export default setActions(actionTypes, actionParams);
```

Cette fonction nous générera les actions suivantes :

```js
{
  getTodos: ()=> {…},
  onGetTodosFailed: ()=> {…},
  onGetTodosSuccess: (result)=> {…}
}
```

Bon en vrai, tu t'en doutes, les function sont en faite remplies de plein de choses. L'idée était de montrer à quoi ressemblent celle-ci.

C'est là qu'on voit pourquoi les actionTypes sont importants. Ce sont eux qui permettent de nommer toutes les fonctions.

Si jamais par contre, comme dans notre cas, tu as des paramètres à faire passer, il faut donc les envoyer de la forme suivante :

```js
{
  ACTION_TYPE: ["premierArg", "deuxiemeArg"];
}
```

Ces paramètres seront automatiquement mappés dans les actions. Par exemple, si j'ai une action comme celle-ci :

```js
const actionParams = {
  GET_TODOS_BY_NAME_LOADING: ['name'],
  [...]
};
```

Et que je l'appelle donc comme suit :

```js
getTodosByName("flchevallier");
```

L'action créée ressemblera à ça :

```json
{
  "name": "flchevallier",
  "type": "application-example:home:getTodosByName:loading"
}
```

Trop facile hein ?

Il est possible de mettre des paramètres facultatifs en rajoutant un `?` à la fin de l'argument. Par exemple :

```js
const actionParams = {
  SEND_MAIL_LOADING: ['email', 'deuxiemeArgFacultatif?'],
  [...]
};
```

Et voilà !

Il existe un cas particulier, celui des erreurs. Dans ce genre de cas, on prends pour acquis que le premier argument sera l'erreur.
Ainsi, si je veux rajouter un action qui aura également un statut en plus de l'erreur, lorsque ça fail, je l'écrirai juste comme ça :

```js
const actionParams = {
  GET_TODOS_LOADING: ['email'],
  GET_TODOS_ERROR: ['status'], // pas besoin de mettre error, car le premier paramètre renvoyé sera forcément l'erreur
  [...]
};
```

Tu peux également surcharger des actions en en rajoutant des nouvelles, car c'est un objet qui est renvoyé. Par exemple, il peut être de bonne pratique d'avoir une action `RESET_STATE`, qui va remettre le state du container à 0.

Tes actions sont desormais générées, et tu peux y accéder à tout moment dans ton code de tes containers.

### Les reducers

Bon, tu as les actionTypes (tu sais nommer les choses) et les actions (tu sais les appeler), maintenant, il faut que tu puisses savoir quoi faire de tous ces évènement que tu dispatch à tout va. Et les reducers sont là pour ça ! Ici, pas de trucs trop trop fou tu vas voir, on est sur du classique redux.

Nous avons donc une actionType (un nom d'action, comme une constante) qui permet de générer les types de clefs pour notre store redux. Comme tu t'en doutes, le but est d'uniformiser tout ça et d'éviter d'écrire trop trop de code.

Ainsi, notre reducer commencera par ça :

```js
import {
  setInitialState,
  setLoadingState,
  setSuccessState,
  setFailureState
} from "@kai23/reduxutils";

import { LOCATION_CHANGE } from "connected-react-router";
import actionTypes from "./actionTypes";

const data = {
  todos: []
};
export const initialState = setInitialState(actionTypes, data);
```

Ici, `data` correspond aux données qui ont besoin d'être persistantes dans le state. Dans notre cas, on a besoin de garder le token validé, pour le transmettre lors du changement de mot de passe. On a donc une clef `token`

Ce `setInitialState()` va nous retourner le state par défaut suivant :

```json
{
  "getTodosError": {},
  "getTodosLoading": false,
  "getTodosSuccess": false,
  "getTodosFailed": false,
  "todos": []
}
```

Super pratique hein ! Voyons les clefs en détail :

- `xxxxLoading` : L'action demandée est en cours
- `xxxxSuccess` : L'action demandée est terminée et a réussi
- `xxxxFailed` : L'action demandée est terminée et a échoué
- `xxxxError` : L'erreur qui a été retournée par le serveur

Rien de bien fou (mais faut bien remplir ce `README`). On remarquera pas contre, une fois de plus, l'importance de bien nommer ses actionTypes.

Passons à la suite du reducer. L'idée est desormais, pour chaque type d'action, de faire changer le state redux pour qu'il reflète la réalité.

```js
[... le code vu au dessus...]

function homeReducer(state = initialState, action) {
  switch (action.type) {
    // ////////////
    // GET_TODOS
    // ////////////
    case actionTypes.GET_TODOS_LOADING:
      return setLoadingState(state, 'getTodos');

    case actionTypes.GET_TODOS_SUCCESS:
      return setSuccessState(state, 'getTodos', { todos: action.result });

    case actionTypes.GET_TODOS_FAILED:
      return setFailureState(state, 'getTodos', action.error.responseJSON);

    case LOCATION_CHANGE:
      return { ...initialState };

    default:
      return state;
  }
}

export default homeReducer;

```

> WHAAAAT MAIS T'AS MIS TROP DE TRUCS D'UN COUP

Oui je sais, mais le code est assez parlant.

Nous avons importé ici trois autres fonctions de notre helper. Ces trois fonctions prennent en paramètre :

- Pour `setLoadingState()` : le state, le nom de la clef à changer, ce qu'il y a à overrider
- Pour `setSuccessState()` : le state, le nom de la clef à changer, ce qu'il y a à overrider
- Pour `setFailureState()` (qui a un alias : `setFailedState()`): le state, le nom de la clef à changer, l'erreur, ce qu'il y a à overrider

Le code de ces fonctions est assez trivial, par exemple, voici `setLoadingState` :

```js
function setLoadingState(state, name, data = {}) {
  const newState = Object.assign({}, state, {
    [`${name}Loading`]: true,
    [`${name}Success`]: false,
    [`${name}Failed`]: false,
    [`${name}Error`]: {}
  });
  return Object.assign(newState, data);
}
```

L'idée de ces fonction est surtout de limiter les erreurs lorsqu'on met des choses à `false` alors qu'elles sont `true` (ça m'est arrivé beaucoup trop souvent, ça vous serait arrivé aussi), mais également de définir le comportement par défaut. Avec ça, vous êtes refait pour l'hiver.

Plus sérieusement, ça permet d'avoir un reducer d'une trentaine de ligne, qui gère tous les cas par défaut et qui évite de mettre du code trop souvent répété. On aurait pu aller plus loin, boucler sur les actionTYpes pour générer automatiquement les différents `case`, mais c'est quand même bien d'avoir un minimum de maitrise sur ce que l'on fait.

### Les sagas

Celle-ci permettent de décoreller complètement la partie "composant" de la partie "appel".
De base, les sagas existent afin de pouvoir être moins dépendant entre container. Voici sa définition :

> The mental model is that a saga is like a separate thread in your application that's solely responsible for side effects. redux-saga is a redux middleware, which means this thread can be started, paused and cancelled from the main application with normal redux actions, it has access to the full redux application state and it can dispatch redux actions as well.

Pratique non ! Du coup, nous on s'en sert pour faire tous les différents appels. L'idée est simple, si on prends le cas du `GET_TODOS`, c'est la saga qui va catcher l'event `GET_TODOS_LOADING` (en même temps que le reducer) pour effectuer la demande au serveur. L'event est donc dispatch, catch deux fois et chacun fait ses trucs. C'est vraiment stylé en terme de décomposition ! (et je parle pas du repas que t'as laissé dans l'évier, sacripan)

Voici ce que ça donnerait pour les TODOS :

```js
import { call, put, takeLatest } from "redux-saga/effects";

import request from "utils/request";
import actions from "./actions";

import actionTypes from "./actionTypes";

/**
 * get todos
 * @param {object} data
 * @yield {Object}
 */
export function* getTodos() {
  const requestURL = `${process.env.API_URL}/todos`;
  try {
    const result = yield call(request, requestURL);
    yield put(actions.onGetTodosSuccess(result));
  } catch (err) {
    yield put(actions.onGetTodosFailed(err));
  }
}

// Root saga
export default function* rootSaga() {
  yield takeLatest(actionTypes.GET_TODOS_LOADING, getTodos);
}
```

Ici, on remarquera qu'on utilise des function generator (appelé aussi `function *` ), vous en avez la doc sur le MDN [ici](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Instructions/function*). En gros, ça ressemble à de l'`async/await` !

Il est possible de récupérer l'action qui a été dispatch via les paramètres de la fonction `getTodos`, par exemple on pourrait faire ça :

```js
/**
 * Get todos by name
 * @param {object} data
 * @yield {Object}
 */
export function* getTodosByName(action) {
  console.log(action);
  /*
  {
    "name":"flchevallier","type":"application-example:home:getTodosByName:loading"
  }
  */
  const requestURL = `${process.env.API_URL}/todos`;
  try {
    const result = yield call(request, requestURL);
    yield put(actions.onGetTodosSuccess(result));
  } catch (err) {
    yield put(actions.onGetTodosFailed(err));
  }
}
```

Franchement, le code parle pour lui même, donc je te laisse voir. Une chose intéressante à savoir et que l'on peut écrire quelque chose comme ça :

```js
const token = yield select((store) => store.session.token);
```

Pour récupérer quelque chose qui viendrait du store.

## Les composants

WHAOUUUUU.

Prends un peu de temps, souffle un peu. On vient de faire quand même pas mal de choses super stylées là !

Allez, trève de galéjades; on passe à la suite.

Cette partie-là est surtout pour t'expliquer comment connecter un container à redux, tout en gardant en tête les différentes conventions que l'on a. Je ne vais pas m'attarder sur l'implémentation de la feature en tant que telle.

Voici donc l'exemple de nos TODOS :

```js
// Juste React <3
import React, { useEffect } from "react";

// compose permet d'éviter d'écrire quelque chose comme :
// withReducer(withSaga(HomePage))
// L'ORDRE A DONC DE L'IMPORTANCE
import { compose } from "redux";

import { useDispatch, useSelector } from "react-redux";
import { useLifecycleSelector } from "@kai23/reduxutils";
import { injectReducer, injectSaga } from "redux-injectors";

import actions from "./core/actions";
import reducer from "./core/reducer";
import saga from "./core/saga";

import "./assets/styles.scss";

const key = "home";

function HomePage() {
  const dispatch = useDispatch();
  const getTodos = useLifecycleSelector(key, "getTodos");
  const todos = useSelector(store => store[key].todos);

  useEffect(() => {
    dispatch(actions.getTodos());
  }, []);

  return (
    <div className="home">
      <h1>
        Example of todos GET
        {getTodos.loading && <p>Chargement des todos...</p>}
        {getTodos.success && todos.map(todo => <p>{todo.title}</p>)}
      </h1>
    </div>
  );
}

const withReducer = injectReducer({ key, reducer });
const withSaga = injectSaga({ key, saga });

export default compose(withReducer, withSaga)(HomePage);
```

Quelques petites remarques sur ce code :

- `useLifecycleSelector` est un utilitaire qui permet de générer un objet qui contient les différents états de notre store pour une clef donnée, sous la forme `{ loading: true, success: false, error: false}`
- Les injecteurs ont toute leur doc [ici](https://github.com/react-boilerplate/redux-injectors#redux-injectors)

Tu as tout compris ? Je pense que tu n'as pas besoin de plus, non ?

Eh bien ça y est, tu (un elfe) libre !

> ATTENDS T'EN VAS PAS CA MARCHE PAS ENCORE

Ah.

C'est pas faux ! C'est bien beau d'écrire toutes ces choses, mais si on ne connait pas l'URL de la feature, ou alors quel component ou quel saga ou quel reducer on utilise pour la route, comment on fait hein ?

En fait, il manque un dernier tout petit truc essentiel : la route !

## Les routes

En fait, les routes sont plutôt faciles à utiliser. Il suffit d'aller dans le fichier `containers/App/index.js`.

En revanche, il serait intéressant de noter plusieurs points :

- Il est de bonne pratique de gére les différents headers/footer à cet endroit
- Il faut également gérer les différents cas : suis-je connecté ? Ais-je le droit d'aller sur cette route là si je suis pas connecté ?

Dans le deuxième cas, tu peux tout simplement créer des composant au dessus de celui de `<Route />`. L'idée étant de gérer les ACL à l'intérieur. Par exemple, pour une route publique :

```js
import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { injectIntl, intlShape } from "react-intl";
import { Route, Redirect } from "react-router-dom";
import Loader from "components/Loader";

const text = "Chargement de la session...";

const PublicRoute = ({
  component: Component,
  intl,
  getSessionError,
  user,
  getSessionSuccess,
  getSessionLoading,
  ...rest
}) => {
  if (getSessionError && getSessionError.statusCode === 401) {
    return <Route {...rest} render={props => <Component {...props} />} />;
  }
  if (getSessionSuccess) {
    return <Redirect to={{ pathname: "/" }} />;
  }
  return <Loader text={text} />;
};

PublicRoute.propTypes = {
  component: PropTypes.func.isRequired,
  getSessionError: PropTypes.object.isRequired,
  getSessionSuccess: PropTypes.bool.isRequired,
  getSessionLoading: PropTypes.bool.isRequired,
  intl: intlShape,
  user: PropTypes.object
};

const mapStateToProps = state => ({
  getSessionSuccess: state.global.getSessionSuccess,
  getSessionLoading: state.global.getSessionLoading,
  getSessionError: state.global.getSessionError,
  user: state.global.session
});

export default injectIntl(connect(mapStateToProps)(PublicRoute));
```

---

On arrive à la fin de cette merveilleuse documentation. Si tu as la moindre question, n'hésite pas à me slacker !

Florian
