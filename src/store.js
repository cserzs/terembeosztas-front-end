import {createStore} from 'vuex';
import axios from 'axios';
import {roomsSeed, beosztasSeed, osztalySeed, reservedSeed} from './seed.js';

/*
reservedRooms felepitese
    pos
    roomlist //ezek a foglaltak
*/

const state = {
    idopontok: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    rooms: [],
    reservedRooms: [],
    schoolclasses: [],
    roomcatalogs: []
};

const mutations = {
    loadRooms(state, payload) {
        state.rooms = payload;
    },
    loadCatalogs(state, payload) {
        state.roomcatalogs = payload;
    },
    loadSchoolclasses(state, payload) {
        state.schoolclasses = payload;
    },
    loadReservedRooms(state, payload) {
        state.reservedRooms = payload;
    },
    addRoomToCatalog(state, payload) {
        const posList = getCatalogPosList(state, payload.classId, payload.pos);
        posList.push(payload.roomId);

        const roomList = getReservedRoomList(state, payload.pos);
        roomList.push(payload.roomId);
    },
    removeRoomFromcatalog(state, payload) {
        const posList = getCatalogPosList(state, payload.classId, payload.pos);
        const roomid = posList.pop();

        const roomList = getReservedRoomList(state, payload.pos);
        let index = roomList.indexOf(roomid);
        roomList.splice(index, 1);
    },
    changeRoomInCatalog(state, payload) {
        const posList = getCatalogPosList(state, payload.classId, payload.pos);
        let oldRoomid = posList[payload.groupId];
        posList[payload.groupId] = payload.roomId;

        const roomlist = getReservedRoomList(state, payload.pos);
        let index = roomlist.indexOf(oldRoomid);
        roomlist.splice(index, 1);
        roomlist.push(payload.roomId);
    }
};

const actions = {
    loadAllDev(context, payload) {
        return new Promise((resolve, reject) => {
            context.commit('loadRooms', roomsSeed);
            context.commit("loadSchoolclasses", osztalySeed);
            let beosztas = beosztasSeed;
            context.commit("loadCatalogs", beosztasSeed);
            
            let reservedRooms = [];
            for(let pos = 0; pos < context.getters.idopontok.length; pos++) {
                let entry = {
                    pos: pos,
                    roomlist: []
                };
                for(let i = 0; i < beosztas.length; i++) {
                    for(let k = 0; k < beosztas[i].roomcatalog[pos].length; k++) {
                        entry.roomlist.push(beosztas[i].roomcatalog[pos][k]);
                    }
                }
                reservedRooms.push(entry);
            }
            context.commit("loadReservedRooms", reservedRooms);
            resolve();
        });
    },
    async loadAll(context, payload) {
        const roomPromise = axios.get('/api/rooms');
        const classPromise = axios.get('/api/classes');
        const catalogPromise = axios.get('/api/catalogofday/' + payload.currentDay);

        const [roomRespond, classRespond, catalogRespond] = await Promise.all([roomPromise, classPromise, catalogPromise]);
        
        context.commit('loadRooms', roomRespond.data);
        context.commit("loadSchoolclasses", classRespond.data);
        context.commit("loadCatalogs", catalogRespond.data);
        
        let beosztas = catalogRespond.data;
        let reservedRooms = [];
        for(let pos = 0; pos < context.getters.idopontok.length; pos++) {
            let entry = {
                pos: pos,
                roomlist: []
            };
            for(let i = 0; i < beosztas.length; i++) {
                for(let k = 0; k < beosztas[i].roomcatalog[pos].length; k++) {
                    entry.roomlist.push(beosztas[i].roomcatalog[pos][k]);
                }
            }
            reservedRooms.push(entry);
        }
        context.commit("loadReservedRooms", reservedRooms);
    },
    addRoom(context, payload) {
        return new Promise((resolve, reject) => {
            axios.post('/api/roombindings', {
                'osztalyid': payload.classId,
                'nap': payload.day,
                'idopont': payload.pos,
                'pozicio': payload.groupId,
                'teremid': payload.roomId})
            .then(() => {
                context.commit('addRoomToCatalog', payload);
            })
            .catch((error) => {
                reject(error);
            });
        });
    },
    proba() {
        return new Promise((resolve, reject) => {
            axios.get('/api/akarmi')
            .then((res) => {
                console.log('sikeres keres');
                resolve("ok");
            })
            .catch((error) => {
                console.log("nem sikerult");
                console.log(error);
                reject("nem ok");
            });
        });
    },
    deleteRoom(context, payload) {
        return new Promise((resolve, reject) => {
            axios.delete('/api/roombindings/' + payload.classId + "/" + 
                payload.day + "/" +
                payload.pos + "/" +
                payload.groupId + "/" +
                payload.roomId)
            .then(() => {
                context.commit('removeRoomFromcatalog', payload);
            })
            .catch((error) => {
                reject(error);
            });
        });
    },
    changeRoom(context, payload) {
        return new Promise((resolve, reject) => {
            axios.put('/api/roombindings/' + payload.classId + "/" + 
                payload.day + "/" +
                payload.pos + "/" +
                payload.groupId + "/" +
                payload.roomId)
            .then(() => {
                context.commit('changeRoomInCatalog', payload);
            })
            .catch((error) => {
                reject(error);
            });
        });
    },
    deleteAllCatalog(context, payload) {
        return new Promise((resolve, reject) => {
            axios.delete('/api/dailyroombindings/' + payload.day)
            .then(() => {
                resolve();
            })
            .catch((error) => {
                reject(error);
            });
        });
    }
};

const getters = {
    isAllLoaded: state => state.allLoaded,
    idopontok: state => state.idopontok,
    getRoomCatalogs(state) { return state.roomcatalogs; },
    getRooms: state => state.rooms,
    getRoomById: state => id => { return state.rooms.find( room => room.id === id) },
    getRoomAt: state => (classId, pos, groupId) => {
        const posList = getCatalogPosList(state, classId, pos);
        return posList[groupId];
    },
    getSchoolclasses: state => state.schoolclasses,
    getReservedRooms: state => state.reservedRooms,
};

function getCatalogPosList(state, classId, pos) {
    const catalogEntry = state.roomcatalogs.find(entry => entry.class_id == classId);
    return catalogEntry.roomcatalog[pos];
}

function getReservedRoomList(state, pos) {
    const reservedEntry = state.reservedRooms.find(entry => entry.pos === pos);
    return reservedEntry.roomlist;
}

export default createStore({state, mutations, actions, getters});
