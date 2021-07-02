import axios from 'axios'
import { ApproveUser, ModalContainer, Modal, ModalHeader, ModalContent, Name, Close } from './NotApprovedStyles'

const NotApprovedComponent = ({ handleClose, show, user, baseUrl }) => {
  const approveUser = async username => {
    await axios.get(`${baseUrl}/admin/api/resources/PseudoUser/records/${username}/approveUser`)
    // eslint-disable-next-line no-undef
    window.location.reload(false)
  }

  return (
    <ModalContainer>
      <Modal show={show}>
        <ModalHeader>
          <Name>{user.username} is not Approved. Approve user to be able to start posting</Name>
          <Close onClick={handleClose}>Close</Close>
        </ModalHeader>
        <ModalContent>
          <ApproveUser onClick={() => approveUser(user.username)}>Approve User</ApproveUser>
        </ModalContent>
      </Modal>
    </ModalContainer>
  )
}

export default NotApprovedComponent