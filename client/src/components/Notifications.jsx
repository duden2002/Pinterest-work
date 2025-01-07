import React, { useImperativeHandle } from 'react'
import { toast } from 'react-toastify';

const Notifications = React.forwardRef((props, ref) => {

    const notifySuccess = (text) => {
        toast.success(text, {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      };

      const notifyError = (text) => {
        toast.error(text)
      }

      useImperativeHandle(ref, () => ({
        notifySuccess,
        notifyError,
      }))

  return (
    <div>

    </div>
  )
})

export default Notifications
