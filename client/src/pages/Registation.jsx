import React from 'react'
import {Formik, Form, Field, ErrorMessage} from 'formik'
import * as Yup from 'yup'
import axios from 'axios'
import logo from "../assets/logo.png"

function Registation({closeModal}) {
  const initialValues = {
    username: "",
    password: "",
  }
  const onSubmit = (data) => {
    axios.post("http://localhost:3001/auth", data).then((response) => {
      console.log("User Created")
      closeModal()
    })
  }

  const validationShema = Yup.object().shape({
    username: Yup.string().min(3).max(15).required(),
    password: Yup.string().min(5).max(20).required()
  })

  return (
    <div>
      <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationShema}>
        <Form className='form'>
          <img src={logo} alt="logo" />
          <h1>Добро пожаловать в <span>Pinterest</span></h1>
          <p>Находите новые идеи для вдохновения</p>
          <div className="form-input">
            <label>Имя пользователя: </label>
            <Field className="input" name="username" placeholder="Имя Пользователя" />
            <label>Пароль: </label>
            <Field className="input" name="password" placeholder="Пароль" type="password" />
            <button className='btn' type='submit'>Регистрация</button>
          </div>
        </Form>
      </Formik>
    </div>
  )
}

export default Registation
