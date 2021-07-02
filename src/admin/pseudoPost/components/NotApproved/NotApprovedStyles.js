import styled from 'styled-components'

export const ApproveUser = styled.button`
  color: #fff;
  padding: 0.8rem;
  font-size: 14px;
  text-transform: uppercase;
  border-radius: 4px;
  font-weight: 400;
  display: block;
  width: 40%;
  cursor: pointer;
  border: 1px solid rgba(61, 143, 68, 1);
  background: #3d8f44;
  &:hover {
    background-color: rgba(61, 143, 68, 0.9);
  }
  margin-bottom: 20px;
  justify-self: flex-end;
`

export const Save = styled.button`
  color: #fff;
  padding: 0.8rem;
  font-size: 14px;
  text-transform: uppercase;
  border-radius: 4px;
  font-weight: 400;
  display: block;
  width: 120px;
  height: 40px;
  cursor: pointer;
  border: none;
  background: #3d8f44;
  &:hover {
    background-color: rgba(61, 143, 68, 0.9);
  }
  margin-right: 10px;
  cursor: pointer;
`

export const ThreadPost = styled.div`
  margin-left: 20px;
  margin-right: 20px;
  border: 1px solid rgba(61, 143, 68, 1);
  border-radius: 0.25rem;
  padding-left: 10px;
  padding-top: 10px;
  padding-bottom: 10px;
  flex-direction: row;
  overflow: hidden;
  margin-bottom: 20px;
  background: #fdfbf7;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 20%;
`
export const Tweet = styled.textarea`
  display: flex;
  width: 75%;
  background: #fdfbf7;
  border: ${props => (props.focus ? '1px solid rgba(61, 143, 68, 1)' : 'none')};
  word-wrap: normal;
  resize: none;
  height: 100%;
`

export const ModalContent = styled.div`
  overflow-y: scroll;
  height: 80%;
`

export const Name = styled.div`
  color: #000;
  font-size: 1.1rem;
  font-weight: normal;
  letter-spacing: 1px;
  text-transform: capitalize;
  margin: 0px;
`

export const ModalHeader = styled.div`
  display: flex;
  flex-direction: row;
  height: 40px;
  width: auto;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  margin-right: 15px;
`

export const Close = styled.button`
  color: #fff;
  padding: 0.8rem;
  font-size: 14px;
  text-transform: uppercase;
  border-radius: 4px;
  font-weight: 400;
  display: block;
  width: 120px;
  cursor: pointer;
  border: none;
  background: #3d8f44;
  &:hover {
    background-color: rgba(61, 143, 68, 0.9);
  }
  margin-right: 10px;
  cursor: pointer;
  height: 40px;
`

export const ModalContainer = styled.div`
  display: flex;
  flex-direction: row;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
`

export const Modal = styled.section`
  position: fixed;
  background: white;
  width: 80%;
  height: 30%;
  min-height: 200px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 10px 20px;
  border: 1px solid rgba(61, 143, 68, 1);
  border-radius: 10px;
  @media screen and (min-width: 1324px) {
  width: 70%;
  margin-left: 150px;
  }
}
`
