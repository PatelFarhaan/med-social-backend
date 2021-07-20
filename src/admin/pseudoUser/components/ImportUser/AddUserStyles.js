import styled from 'styled-components'

export const Loading = styled.div`
  margin-top: 12px;
  color: rgba(61, 143, 68, 0.9);
  font-size: 13px;
`

export const Error = styled.div`
  margin-top: 12px;
  color: red;
  font-size: 13px;
`

export const Container = styled.div`
  display: flex;
  justify-content: center;
`

export const Submit = styled.button`
  margin-top: 15px;
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

export const UploadPermissionsText = styled.div`
  margin-bottom: 5px;
  color: rgba(61, 143, 68, 1);
  font-weight: bold;
`

export const InputTwitterUrl = styled.input`
  display: flex;
  width: 200px;
  background: #fdfbf7;
  border: 1px solid rgba(61, 143, 68, 1);
  height: 30px;
  word-wrap: normal;
  resize: none;
  padding: 5px 25px;
  border-radius: 0.25rem;
`

export const ImportUserForm = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 300px;
  width: 50%;
  background: #fdfbf7;
  border: 1px solid rgba(61, 143, 68, 1);
  border-radius: 0.25rem;
  padding-left: 10px;
  padding-top: 10px;
  padding-bottom: 10px;
`

export const UploadPermissions = styled.div`
  margin-top: 20px;
`
