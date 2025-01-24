import React from 'react'
import {Formik, Form, Field, ErrorMessage} from 'formik'
import * as Yup from 'yup'
import axios from 'axios'
import logo from "../assets/logo.png"
import Notifications from '../components/Notifications';
import { useRef } from 'react'

function Registation({closeModal, openLogin}) {
  let regRef = useRef(null)
  const initialValues = {
    username: "",
    password: "",
  }
  const onSubmit = (data) => {
    axios.post("http://localhost:3001/auth", data).then((response) => {
      if (response.data.error) {
        console.log("error")
        regRef.current.notifyError(response.data.error)
      }
      else {
        console.log("User Created")
        closeModal()
        openLogin()
        regRef.current.notifySuccess("Регистрация прошла успешно!")
      }
    })
  }

  const validationShema = Yup.object().shape({
    username: Yup.string().min(5, 'Минимальная длина имени — 5 символов').max(15, "Максимальная длина имени — 15 символов").required("Введите имя пользователя"),
    password: Yup.string().min(5, 'Минимальная длина пароля — 5 символов').max(20, "Максимальная длина пароля — 15 символов").required("Введите пароль")
  })

  return (
    <div>
      <Notifications ref={regRef} />
      <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationShema}>
      {({ errors, touched }) => (
        <Form className='form'>
          <img src={logo} alt="logo" />
          <h1>Добро пожаловать в <span>Pinterest</span></h1>
          <p>Находите новые идеи для вдохновения</p>
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
            <button className='btn' type='submit'>Регистрация</button>
            <p className='linkTo'>Уже есть аккаунт? <span className="link" onClick={openLogin}>Войти</span></p>
          </div>
        </Form>
      )}
      </Formik>
    </div>
  )
}

export default Registation
