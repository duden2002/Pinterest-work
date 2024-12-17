import React, { useContext } from 'react'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { AuthContext } from '../helpers/AuthContext'
import axios from 'axios'
import logo from '../assets/logo.png'

function Login({ closeModal }) {
    const { setAuthState } = useContext(AuthContext)

    const initialValues = {
        username: "",
        password: "",
    }

    const validationSchema = Yup.object().shape({
        username: Yup.string().min(3).max(15).required("Username is required"),
        password: Yup.string().min(5).max(20).required("Password is required"),
    })

    const onSubmit = (data) => {
        axios.post("http://localhost:3001/auth/login", data, { withCredentials: true })
            .then((response) => {
                if (response.data.error) {
                    alert(response.data.error)
                } else {
                    setAuthState({
                        username: response.data.username,
                        id: response.data.id,
                        status: true
                    })
                    closeModal()  // Close the modal after successful login
                    
                    
                }
            })
    }

    return (
        <div className='main'>
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
                <Form>
                    <div className='form'>
                        <img src={logo} alt="logo" />
                        <h1>С возвращением в <span>Pinterest</span></h1>
                        <div className="form-input">
                            <label>Имя пользователя: </label>
                            <Field className="input" name="username" placeholder="Имя Пользователя" />
                            <label>Пароль: </label>
                            <Field className="input" name="password" placeholder="Пароль" type="password" />
                            <button className='btn' type='submit'>Войти</button>
                        </div>
                    </div>
                </Form>
            </Formik>
        </div>
    )
}

export default Login