import React, { useContext, useRef } from 'react'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { AuthContext } from '../helpers/AuthContext'
import axios from 'axios'
import logo from '../assets/logo.png'
import Notifications from '../components/Notifications';
import { useNavigate } from 'react-router-dom'

function Login({ closeModal, openRegistration}) {
    let authRef = useRef(null)
    const navigate = useNavigate()
    const { setAuthState } = useContext(AuthContext)

    const initialValues = {
        username: "",
        password: "",
    }

    const validationSchema = Yup.object().shape({
        username: Yup.string().min(3, 'Минимальная длина имени — 3 символов').max(15, "Максимальная длина имени — 15 символов").required("Введите имя пользователя"),
        password: Yup.string().min(5, 'Минимальная длина пароля — 5 символов').max(20, "Максимальная длина пароля — 15 символов").required("Введите пароль")
    })

    const onSubmit = (data) => {
        console.log("fdgdg")
        axios.post("http://localhost:3001/auth/login", data, { withCredentials: true })
            .then((response) => {
                console.log("dfgfddfgg",response)
                if (response.data.error) {
                    authRef.current.notifyError("Неправильно введен имя пользователя и/или пароль")
                } else {
                    console.log("dfgfddfgg",response)
                    setAuthState({
                        username: response.data.username,
                        id: response.data.id,
                        status: true
                    })
                    navigate('/posts')
                    closeModal()  // Close the modal after successful login
                    authRef.current.notifySuccess(`Добро пожаловать ${data.username}`)
                    
                }
            })
    }

    return (
        <div className='main'>
            <Notifications ref={authRef} />
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
            {({ errors, touched }) => (
                <Form>
                    <div className='form'>
                        <img src={logo} alt="logo" />
                        <h1>С возвращением в <span>Pinterest</span></h1>
                        <div className="form-input">
                            <label>Имя пользователя: </label>
                            <Field className="input" name="username" placeholder="Имя Пользователя" style={{border: errors.username && touched.username ? '2px solid red' : ''}} />
                            {errors.username && touched.username && (
          <div className='regError'>{errors.username}</div>
        )}
                            <label>Пароль: </label>
                            <Field className="input" name="password" placeholder="Пароль" type="password" style={{border: errors.password && touched.password ? '2px solid red' : ''}} />
                            {errors.password && touched.password && (
          <div className='regError'>{errors.password}</div>
        )}
                            <button className='btn' type='submit'>Войти</button>
                            <p className='linkTo'>Еще нет аккаунта? <span className="link" onClick={openRegistration}>Регистрация</span></p>
                        </div>
                    </div>
                </Form>
            )}
            </Formik>
        </div>
    )
}

export default Login