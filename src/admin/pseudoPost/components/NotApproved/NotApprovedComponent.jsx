import axios from 'axios'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useHistory } from 'react-router-dom'
import { ApproveUser, ModalContainer, Modal, ModalHeader, ModalContent, Name, Close, Multiselect, ModalText } from './NotApprovedStyles'
import Select from '../Select/Select'

const NotApprovedComponent = ({ handleClose, show, user, baseUrl }) => {
  const [expertises, setExpertises] = useState([])
  const [values, setValues] = useState([])
  const [selectedExpertises, setSelectedExpertises] = useState([])
  const history = useHistory()

  const approveUser = async username => {
    const _expertises = []
    expertises.map(expertise => {
      selectedExpertises.map(selectedExpertise => {
        if (selectedExpertise === expertise.params.name) {
          _expertises.push(expertise.params.id)
        }
      })
    })
    await axios.get(`${baseUrl}/admin/api/resources/PseudoUser/records/${username}/approveUser`, {
      headers: {
        expertises: _expertises
      }
    })
    history.push(`/admin/resources/PseudoPost?filters.username=${username}`)
    handleClose()
  }

  useEffect(() => {
    const getExpertises = async () => {
      const response = await axios.get(`${baseUrl}/admin/api/resources/Expertise/actions/list`)

      setExpertises(response.data.records)
      const _values = response.data.records.map(record => {
        record.params.value = record.params.name
        return record.params
      })
      setValues(_values)
    }

    getExpertises()
  }, [])

  const changeSelected = _values => {
    setSelectedExpertises(_values)
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
              label="Expertises:"
              placeholder="Choose expertises"
              options={values}
              changeSelected={changeSelected}
              selectedExpertises={selectedExpertises}
              multiple
            />
          </Multiselect>
          <ApproveUser onClick={() => approveUser(user.username)} disabled={!selectedExpertises.length}>
            Approve User
          </ApproveUser>
        </ModalContent>
      </Modal>
    </ModalContainer>
  )
}

export default NotApprovedComponent
