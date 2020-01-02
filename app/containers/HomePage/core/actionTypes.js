import { setActionTypes } from '@kai23/reduxutils';

const prefixes = ['GET_TODOS'];

const actionTypes = setActionTypes(prefixes, 'home', 'application-example');

export default actionTypes;
