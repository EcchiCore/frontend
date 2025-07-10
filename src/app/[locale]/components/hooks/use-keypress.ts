import { useState, useEffect, useCallback } from 'react';

type KeyPressHandler = ((event: KeyboardEvent) => void) | null;

function useKeypress(targetKey: string, handler: KeyPressHandler) {
    const [keyPressed, setKeyPressed] = useState(false);

    const downHandler = useCallback((event: KeyboardEvent) => {
         if(event.key === targetKey && handler) {
            setKeyPressed(true);
            handler(event);
        }
    }, [handler, targetKey]);

    const upHandler = useCallback((event: KeyboardEvent) => {
       if(event.key === targetKey && handler){
            setKeyPressed(false);
        }
    }, [handler, targetKey]);

    useEffect(() => {
        window.addEventListener('keydown', downHandler);
        window.addEventListener('keyup', upHandler);

        return () => {
            window.removeEventListener('keydown', downHandler);
            window.removeEventListener('keyup', upHandler);
        };
    }, [downHandler, upHandler]);

    return keyPressed;
}


export { useKeypress };