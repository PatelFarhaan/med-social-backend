import axios from 'axios'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useHistory } from 'react-router-dom'
import Select from 'react-select'
import { ApproveUser, ModalContainer, Modal, ModalHeader, ModalContent, Name, Close, Multiselect, ModalText } from './NotApprovedStyles'

const NotApprovedComponent = ({ handleClose, show, user, baseUrl }) => {
  const [expertises, setExpertises] = useState([])
  const [selectedExpertises, setSelectedExpertises] = useState([])
  const history = useHistory()

  const approveUser = async username => {
    const _expertises = []
    expertises.map(expertise => {
      selectedExpertises.map(selectedExpertise => {
        if (selectedExpertise.params.name === expertise.params.name) {
          _expertises.push(expertise.params.id)
        }
      })
    })
    await axios.get(`${baseUrl}/admin/api/resources/PseudoUser/records/${username}/approveUser`, {
      headers: {
        expertises: _expertises
      }
    })
    history.push(`/admin/resources/PseudoPost?filters.username=${username}&direction=desc&sortBy=createdAt&refresh=true`)
    handleClose()
  }

  useEffect(() => {
    const getExpertises = async () => {
      const response = await axios.get(`${baseUrl}/admin/api/resources/Expertise/actions/list?perPage=500`)
      if (!response.data.records) {
        return
      }
      response.data.records.forEach(_record => {
        _record.value = _record.params.name
        _record.label = _record.params.name
      })
      setExpertises(response.data.records)
    }

    getExpertises()
  }, [])

  const changeSelected = _values => {
    setSelectedExpertises(_values)
  }
  if (!expertises) {
    return <h2>Loading..</h2>
  }
  return (
    <ModalContainer>
      <Modal show={show}>
        <ModalHeader>
          <ModalText>
            <Name errorText>{user.username} is not Approved</Name>
            <Name>Choose expertises and approve user</Name>
          </ModalText>
          <Close onClick={handleClose}>Close</Close>
        </ModalHeader>
        <ModalContent>
          <Multiselect>
            <Select
              isMulti
              classNamePrefix="react-select"
              placeholder="Select expertises"
              options={expertises}
              menuPortalTarget={document.body}
              styles={{ menuPortal: base => ({ ...base, zIndex: 12 }) }}
              onChange={changeSelected}
            />
          </Multiselect>
          <ApproveUser onClick={() => approveUser(user.username)} disabled={!selectedExpertises?.length}>
            Approve User
          </ApproveUser>
        </ModalContent>
      </Modal>
    </ModalContainer>
  )
}

export default NotApprovedComponent
