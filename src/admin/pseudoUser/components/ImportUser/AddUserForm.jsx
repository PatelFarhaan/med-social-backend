import axios from 'axios'
import { useState } from 'react'
import styled from 'styled-components'
import { useHistory } from 'react-router-dom'
import { Container, ImportUserForm, InputTwitterUrl, UploadPermissions, UploadPermissionsText, Submit, Loading } from './AddUserStyles'

const AddUserForm = props => {
  const [selectedFile, setSelectedFile] = useState(0)
  const [twitterUrl, setTwitterUrl] = useState(0)
  const [errorMessage, setErrorMessage] = useState(0)
  const [loading, setLoading] = useState(false)
  const history = useHistory()

  const handleDropZoneChange = event => {
    setSelectedFile(event.target.files[0])
  }

  const submit = async () => {
    if (!twitterUrl || !selectedFile) {
      setErrorMessage('Please enter url and upload a permissions file')
    }
    setErrorMessage(0)
    setLoading(true)
    const data = new FormData()
    data.append('file', selectedFile)
    data.append('url', twitterUrl)
    const url = `${props.action.custom.baseUrl}/admin/api/resources/PseudoUser/actions/new`
    await axios.post(url, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    history.push(`/admin/resources/PseudoUser/`)
  }

  return (
    <Container>
      <ImportUserForm>
        <InputTwitterUrl placeholder="Input Twitter URL" onChange={e => setTwitterUrl(e.target.value)} />
        <UploadPermissions>
          <UploadPermissionsText>Upload Permission file: </UploadPermissionsText>
          <input type="file" className="form-control" name="upload_file" onChange={handleDropZoneChange} />
          <Submit disabled={loading} onClick={submit}>
            Submit
          </Submit>
          {errorMessage ? <Error>{errorMessage}</Error> : null}
          {loading ? <Loading>Importing user, please wait...</Loading> : null}
        </UploadPermissions>
      </ImportUserForm>
    </Container>
  )
}

export default AddUserForm
