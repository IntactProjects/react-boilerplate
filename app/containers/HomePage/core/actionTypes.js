import { setActionTypes } from '@kai23/reduxutils';

const prefixes = ['GET_TODOS'];

const actionTypes = setActionTypes(prefixes, 'users', 'application-example');

export default actionTypes;
