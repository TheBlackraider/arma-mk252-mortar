
// Define action types
const GET_ALL_ITEMS = 'GET_ALL_ITEMS';
const CALCULATE_ITEM = 'CALCULATE_ITEM';
const RECALCULATE_ITEM = 'RECALCULATE_ITEM';
const DELETE_ITEM = 'DELETE_ITEM';
const CLEAR_TABLE = 'CLEAR_TABLE';

// Define action creators

const getAllItems = () => {
    return {
        type: GET_ALL_ITEMS
    };
};


const calculateItem = (item) => {
    return {
        type: CALCULATE_ITEM,
        payload: item
    };
};

const recalculateItem = (item) => ({ type: RECALCULATE_ITEM, payload: item });
const deleteItem = (key) => ({ type: DELETE_ITEM, payload: { key } });
const clearTable = () => ({ type: CLEAR_TABLE });

export {
    GET_ALL_ITEMS, CALCULATE_ITEM, RECALCULATE_ITEM, DELETE_ITEM, CLEAR_TABLE,
    getAllItems, calculateItem, recalculateItem, deleteItem, clearTable,
};
