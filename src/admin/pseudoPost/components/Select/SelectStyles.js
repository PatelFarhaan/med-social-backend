import styled from 'styled-components'

export const Container = styled.div``

export const Value = styled.div``

export const Delete = styled.div`
  top: 0;
  right: 0;
  display: block;
  padding: 10px;
  font-size: 10px;
  cursor: pointer;
  svg {
    display: block;
    width: 1em;
    height: 1em;
    fill: currentColor;
  }
`

export const Span = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-right: 30px;
  margin-right: 5px;
  background: #fdfbf6;
  color: #3c8f44;
  position: relative;
  padding: 5px 10px;
  width: 100px;
  height: 30px;
`

export const Placeholder = styled.div`
  padding: 5px 10px;
  color: #898989;
`

export const Options = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  border: solid #ddd;
  border-width: 0 1px;
  background: #fff;
`

export const Checkbox = styled.span`
  content: '';
  vertical-align: top;
  display: inline-block;
  width: 16px;
  height: 16px;
  padding: 2px;
  border: 1px solid #ddd;
  border-radius: 2px;
  margin: 2px 12px 0 0;
  color: #3c8f44;
  font-size: 10px;
  .selected & {
    border-color: #3c8f44;
    background: #fdfbf6;
    color: #3c8f44;
  }
`

export const OptionDiv = styled.div`
  padding: 10px 15px;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
  ${props =>
    props.className.indexOf('selected') !== -1 &&
    `
  border: 1px solid #3C8F44;
  margin: -1px -1px 0;
  background: #FDFBF6;
`}
  ${props =>
    props.className.indexOf('focused') !== -1 &&
    `
  background: #f5f5f5;
`}
`

export const Arrow = styled.span`
  position: absolute;
  top: 5px;
  right: 5px;
  display: block;
  padding: 10px;
  font-size: 10px;
  color: #3c8f44;
  svg {
    display: block;
    width: 1em;
    height: 1em;
    fill: #3c8f44;
  }
`

export const Selection = styled.div`
  display: flex;
  flex-direction: row;
  position: relative;
  padding: 5px;
  border: 1px solid #ddd;
  background: #fff;
  flex-wrap: wrap;
`

export const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
`

export const SelectDiv = styled.div`
  position: relative;
  display: inline-block;
  width: 320px;
  &:focus {
    outline: 0;
    & .selection {
      box-shadow: 0 0 1px 1px #00a9e0;
    }
  }
`
