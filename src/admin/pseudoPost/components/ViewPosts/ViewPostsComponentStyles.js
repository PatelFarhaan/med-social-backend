import styled from 'styled-components'

export const TitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

export const CardColumn = styled.div`
  color: #3d8f44;
  font-weight: 900;
  font-size: 15px;
`

export const Buttons = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
`
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

export const UserApproved = styled.button`
  color: #fff;
  padding: 0.8rem;
  font-size: 14px;
  text-transform: uppercase;
  border-radius: 4px;
  font-weight: 400;
  display: block;
  width: 40%;
  cursor: not-allowed;
  border: 1px solid rgba(61, 143, 68, 1);
  background: #77a97c;
  margin-bottom: 20px;
  justify-self: flex-end;
`

export const Delete = styled.button`
  color: #3d8f44;
  padding: 0.8rem;
  font-size: 14px;
  text-transform: uppercase;
  border-radius: 4px;
  font-weight: 400;
  display: block;
  width: 120px;
  cursor: pointer;
  border: 1px solid rgba(61, 143, 68, 1);
  background: transparent;
  &:hover {
    background-color: rgba(255, 255, 255, 0.75);
  }
`

export const Left = styled.div`
  width: 300px;
  display: flex;
  flex-direction: column;
`

export const Post = styled.button`
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
    background-color: ${props => (props.thread ? 'rgba(255, 255, 255, 0.75)' : 'rgba(61, 143, 68, 0.9))')};
  }
  ${props =>
    props.thread &&
    `
    color: #3d8f44;
    border: 1px solid #3d8f44;
    background: none
    
  `}
`

export const CreatedTime = styled.p`
  color: #3d8f44;
  margin-top: 4px;
  margin-bottom: 15px;
  align-self: flex-start;
`

export const SelectDiv = styled.div`
  margin-bottom: 10px;
  select {
    height: 20px;
  }
  width: 240px;
`
export const Right = styled.div`
  width: 60%;
  display: flex;
  flex-direction: column;
`

export const ButtonBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

export const CardText = styled.p`
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1.25rem;
  font-weight: 400;
  a {
    color: blue;
  }
`

export const CardTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: capitalize;
  margin: 0px;
`

export const CardContent = styled.div`
  padding: 1rem;
  width: 100%;
`

export const CardImage = styled.img`
  height: auto;
  max-width: 40%;
  vertical-align: middle;
`

export const Card = styled.div`
  border: 1px solid rgba(61, 143, 68, 1);
  background: #fdfbf7;
  a {
    color: blue;
    text-decoration: none;
  }
  border-radius: 0.25rem;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  margin-bottom: 20px;
  width: auto;
`

export const CardContainer = styled.li`
  a {
    color: blue;
    text-decoration: none;
  }
  display: flex;
  flex-direction: column;
  padding: 1rem;
  justify-content: space-between;
  width: auto;
`

export const Container = styled.ul`
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  margin: 0;
  padding: 0;
`

export const Layout = styled.div`
  /* max-width: 1200px; */
  margin: 0 auto;
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  html {
    background-color: #ecf9ff;
  }
  body {
    font-family: 'Quicksand', serif;
    font-style: normal;
    font-weight: 400;
    letter-spacing: 0;
    padding: 1rem;
  }
`

export const MainContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`
export const PostsContainer = styled.div``

export const Posts = styled.div`
  background-color: lightgray;
  padding: 2%;
  border: 2px solid rgba(61, 143, 68, 1);
  width: 1075px;
`
export const TabBar = styled.div`
  display: flex;
  margin-bottom: 0;
`

export const Tab = styled.div`
  color: #fff;
  padding: 0.8rem;
  font-size: 14px;
  text-transform: uppercase;
  /* border-radius: 4px; */
  border-top: 4px;
  font-weight: 400;
  display: flex;
  width: 40%;
  cursor: pointer;
  border: 1px solid rgba(61, 143, 68, 1);
  background: #3d8f44;
  &:hover {
    background-color: rgba(61, 143, 68, 0.9);
  }
  justify-content: center;
  align-items: center;
  ${props =>
    props.disableTab &&
    `
    cursor: pointer;
    background: #fff;
    color: rgba(61, 143, 68, 1);
    cursor: pointer;
    &:hover {
      color: #fff;
      background-color: rgba(61, 143, 68, 0.9);
    }
`}
`
