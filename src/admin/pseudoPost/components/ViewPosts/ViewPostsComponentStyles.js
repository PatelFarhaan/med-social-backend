import styled from 'styled-components'

export const Buttons = styled.button`
  display: flex;
  flex-direction: row;
  background-color: red;
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
  width: 200px;
  margin-right: 16px;
  cursor: pointer;
  border: none;
  background: #3d8f44;
  &:hover {
    background-color: rgba(61, 143, 68, 0.9);
  }
`
export const Select = styled.div`
  margin-bottom: 10px;
  select {
    height: 20px;
  }
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
  color: #000;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1.25rem;
  font-weight: 400;
`

export const CardTitle = styled.h2`
  color: #000;
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
    color: #f9f9f9;
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
    color: #f9f9f9;
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
    color: #272727;
    font-family: 'Quicksand', serif;
    font-style: normal;
    font-weight: 400;
    letter-spacing: 0;
    padding: 1rem;
  }
`
