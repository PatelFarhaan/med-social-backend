import styled from 'styled-components'

export const Layout = styled.div`
  display: flex;
  flex-direction: column;
  color: #f9f9f9;
  justify-content: center;
  align-items: center;
  padding-top: 40px;
`

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  color: #000;
  border: 1px solid rgba(61, 143, 68, 1);
  background: #fdfbf7;
  border-radius: 0.25rem;
  justify-content: center;
  align-items: center;
  padding-top: 40px;
  width: 420px;
  min-height: 640px;
  height: 70%;
`

export const Image = styled.div`
  height: 200px;
  width: 200px;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  margin-bottom: 54px;
  display: flex;
  justify-content: center;

  img {
    display: inline;
    margin: 0 auto;
    height: 100%;
    width: auto;
  }
`

export const Bio = styled.div`
  padding: 2px;
`

export const Name = styled.div`
  padding: 2px;
`

export const Expertises = styled.div`
  padding: 2px;
  margin-bottom: 15px;
`

export const Header = styled.div`
  color: rgba(61, 143, 68, 1);
  margin-bottom: 2px;
  font-size: 0.9rem;
`
export const Content = styled.textarea`
  border-radius: 0.25rem;
  border: 1px solid rgba(61, 143, 68, 1);
  display: flex;
  width: 232px;
  background: #fdfbf7;
  border: ${props => (props.focus ? '1px solid rgba(61, 143, 68, 1)' : 'none')};
  word-wrap: normal;
  resize: none;
  height: 100%;
`

export const ExpertiseContent = styled.div`
  border-radius: 0.25rem;
  display: flex;
  width: 232px;
  background: #fdfbf7;
  word-wrap: normal;
  resize: none;
  height: 100%;
  flex-direction: column;
  padding: 2px;
  font-family: monospace;
  color: #545454;
`

export const Select = styled.div`
  margin-bottom: 10px;
  select {
    height: 20px;
    width: 232px;
  }
`

export const Save = styled.button`
  color: #fff;
  padding: 0.8rem;
  font-size: 14px;
  text-transform: uppercase;
  border-radius: 4px;
  font-weight: 400;
  display: block;
  width: 240px;
  cursor: pointer;
  border: none;
  background: #3d8f44;
  &:hover {
    background-color: rgba(61, 143, 68, 0.9);
  }
`
