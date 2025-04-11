// components/Toaster.tsx
'use client';

import { Toaster as HotToaster, toast } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';

export const Toaster = () => (
    <HotToaster
        position="bottom-center"
        containerClassName=""
        containerStyle={{
            position: 'absolute',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            pointerEvents: 'none',
            bottom: '7rem',
        }}
    >
        {(t) => (
            <AnimatePresence>
                {t.visible && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className={`${
                            t.type === 'error'
                                ? 'bg-red-500 text-white'
                                : t.type === 'success'
                                ? 'bg-green-500 text-white'
                                : 'bg-popover-notification text-white'
                        } px-6 py-1.5 shadow-lg rounded-lg flex items-center justify-between max-w-md w-full pointer-events-auto`}
                    >
                        <span className="text-sm text-center w-full">
                            {typeof t.message === 'function' ? t.message(t) : t.message}
                        </span>
                        {/* <button
                            onClick={() => toast.dismiss(t.id)}
                            className="ml-4 text-inherit hover:opacity-80"
                        >
                            ✕
                        </button> */}
                    </motion.div>
                )}
            </AnimatePresence>
        )}
    </HotToaster>
);