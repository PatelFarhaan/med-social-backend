import styled from 'styled-components'
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useHistory } from 'react-router-dom'
import {
  Layout,
  Container,
  Image,
  Bio,
  Header,
  Content,
  Name,
  Loading,
  Permissions,
  Submit,
  UploadPermissionsText,
  InputTwitterUrl,
  ImportUserForm,
  UploadPermissions,
  Error
} from './ProfileStyles'

const Profile = props => {
  const { bio, username, profileImageUrl, permissionFileUrl } = props.record.params

  const [errorMessage, setErrorMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const history = useHistory()

  const inputRef = useRef()

  const submit = async () => {
    const file = inputRef.current.files[0]
    if (!file) {
      setErrorMessage('Please attach permissions file')
    } else {
      setErrorMessage(0)
      setLoading(true)
      const data = new FormData()
      data.append('file', file)
      data.append('handle', username)
      const url = `${props.action.custom.baseUrl}/admin/api/resources/PseudoUser/actions/uploadPermissions`
      await axios.post(url, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      history.push(`/admin/resources/PseudoUser/`)
    }
  }

  return (
    <Layout>
      <Container>
        <Image>
          <img src={profileImageUrl.replace('_normal', '')} alt={`${username}_avatar`} />
        </Image>
        <Name>
          <Header>Username:</Header>
          <Content type="text" defaultValue={username} disabled />
        </Name>
        <Bio>
          <Header>Bio:</Header>
          <Content type="text" defaultValue={bio} disabled />
        </Bio>
        {permissionFileUrl ? (
          <Permissions>
            <Header>Permissions File:</Header>
            <a href={permissionFileUrl} download>
              Click here to download
            </a>
          </Permissions>
        ) : (
          <UploadPermissions>
            <UploadPermissionsText>Upload Permission file: </UploadPermissionsText>
            <input type="file" ref={inputRef} />
            <Submit disabled={loading} onClick={submit}>
              Submit
            </Submit>
            {errorMessage ? <Error>{errorMessage}</Error> : null}
            {loading ? <Loading>Importing user, please wait...</Loading> : null}
          </UploadPermissions>
        )}
      </Container>
    </Layout>
  )
}

export default Profile
