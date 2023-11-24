import React, { useEffect, useRef } from 'react'
import Codemirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/theme/dracula.css'
import 'codemirror/addon/edit/closetag'
import 'codemirror/addon/edit/closebrackets'
import ACTIONS from '../Actions'

function Editor({ socketRef, roomId, onCodeChange }) {

    // we have to store the reference of the editor 
    const editorRef = useRef(null);

    useEffect(() => {
        async function init() {
            editorRef.current = Codemirror.fromTextArea(document.getElementById('realtimeEditor'), {
                mode: { name: 'javascript', json: true },
                theme: 'dracula',
                autoCloseTag: true,
                autoCloseBrackets: true,
                lineNumbers: true,
            })

            editorRef.current.on('change', (instance, changes) => {
                // console.log('changes', changes);
                const { origin } = changes; // tells which type of operation performed in editor like insert text , delete text , cut , paste etc -> you can see on console 

                // storing all code written in editor
                let code = instance.getValue();
                onCodeChange(code); //passing the code and execute the function and this function will be execute in EditorPage.js line 128

                // console.log(code); // receiving all the text in console
                if (origin !== 'setValue') {
                    // sending this event on server.js
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                        roomId,
                        code,
                    })
                }

            })


        }
        init();
    }, [])

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                // console.log('codes ->', code); for debug purpose
                if (code !== null) {
                    editorRef.current.setValue(code)
                }
            })
        }

        // unsubscribe the code_change method
        return () => {
            socketRef.current.off(ACTIONS.CODE_CHANGE);
        }

    }, [socketRef.current])

    return (
        <textarea id='realtimeEditor'></textarea>
    )
}

export default Editor
