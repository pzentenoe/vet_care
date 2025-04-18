/**
 * Utilidad para manejar operaciones de almacenamiento que funcionan tanto en el servidor como en el cliente
 */

const isBrowser = typeof window !== 'undefined';

/**
 * Almacenamiento local seguro que funciona tanto en el servidor como en el cliente
 */
export const safeStorage = {
    /**
     * Obtiene un valor del almacenamiento
     * @param key Clave del valor a obtener
     * @param defaultValue Valor por defecto si no existe la clave o hay un error
     */
    get: <T>(key: string, defaultValue: T): T => {
        if (!isBrowser) return defaultValue;

        try {
            const item = localStorage.getItem(key);
            if (!item) return defaultValue;
            return JSON.parse(item) as T;
        } catch (error) {
            console.warn(`Error al leer ${key} de localStorage:`, error);
            return defaultValue;
        }
    },

    /**
     * Guarda un valor en el almacenamiento
     * @param key Clave del valor a guardar
     * @param value Valor a guardar
     */
    set: <T>(key: string, value: T): void => {
        if (!isBrowser) return;

        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn(`Error al guardar ${key} en localStorage:`, error);
        }
    },

    /**
     * Elimina un valor del almacenamiento
     * @param key Clave del valor a eliminar
     */
    remove: (key: string): void => {
        if (!isBrowser) return;

        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn(`Error al eliminar ${key} de localStorage:`, error);
        }
    },

    /**
     * Comprueba si una clave existe en el almacenamiento
     * @param key Clave a comprobar
     */
    has: (key: string): boolean => {
        if (!isBrowser) return false;

        try {
            return localStorage.getItem(key) !== null;
        } catch (error) {
            console.warn(`Error al comprobar ${key} en localStorage:`, error);
            return false;
        }
    }
};