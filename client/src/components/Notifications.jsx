import React, { useImperativeHandle } from 'react'
import { toast } from 'react-toastify';

const Notifications = React.forwardRef((props, ref) => {

    const notifySuccess = (text) => {
        toast.success(text, {
          position: 'top-center',
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      };

      const notifyError = (text) => {
        toast.error(text, {
          position: 'top-center',
          autoClose: 3000,
        })
      }

      const notifyInfo = (text) => {
        toast.info(text, {
          position: 'top-center',
          autoClose: 2000,
        })
      }

      useImperativeHandle(ref, () => ({
        notifySuccess,
        notifyError,
        notifyInfo,
      }))

  return (
    <div>

    </div>
  )
})

export default Notifications
