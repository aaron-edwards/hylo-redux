import React from 'react'
import { connect } from 'react-redux'
import { cancelTagDescriptionEdit, editTagDescription } from '../actions'
import Icon from './Icon'
import { debounce, keys, isEmpty, map, omit } from 'lodash'
import { hashtagWordRegex } from '../models/hashtag'
const { func, object } = React.PropTypes

@connect((state, props) => ({
  tags: state.tagDescriptionEdits
}))
export default class TagDescriptionEditor extends React.Component {
  static propTypes = {
    tags: object,
    savePost: func,
    saveTagDescriptions: func,
    updatePostTag: func,
    dispatch: func
  }

  render () {
    let { tags, savePost, updatePostTag, dispatch } = this.props
    const cancel = () => dispatch(cancelTagDescriptionEdit())
    const edit = debounce((tag, value) =>
      dispatch(editTagDescription(tag, value)), 200)

    if (isEmpty(tags)) return null

    let creating = tags.creating === true
    if (creating) {
      tags = omit(tags, 'creating')
    }

    const validate = tags => {
      // only called when creating a tag so we can assume there is exactly one tag
      let tag = keys(tags)[0]
      if (tag[0].match(/[^A-Za-z]/)) {
        window.alert('Topic names must start with a letter')
        return false
      } else if (tag.length < 2) {
        window.alert('Topic names must be at least 2 characters')
        return false
      } else if (!tag.match(hashtagWordRegex)) {
        window.alert('Topic names can only use letters, numbers and underscores, with no spaces.')
        return false
      }
      return true
    }
    const createTag = () => {
      if (!validate(tags)) return
      updatePostTag(tags)
      cancel()
    }

    return <div id='tag-description-editor'>
      <div className='backdrop'/>
      <div className='modal'>
        <h2>
          Hey, you're creating&nbsp;
          {keys(tags).length > 1 ? 'new topics.' : 'a new topic.'}
          <a className='close' onClick={cancel}><Icon name='Fail'/></a>
        </h2>
        {map(tags, (description, tag) => <div key={tag} className='tag-group'>
          <div className='topic'>
            <label>Topic</label>
            {creating
            ? <span>#<input type='text' defaultValue={tag}
              onChange={event => edit(event.target.value, description)}/></span>
            : <span>#{tag}</span>}
          </div>
          <div className='description'>
            <label>Description</label>
            <input type='text' defaultValue={description}
              onChange={event => edit(tag, event.target.value)}/>
          </div>
        </div>)}
        <div className='footer'>
          {creating
          ? <button onClick={createTag} className='ok'>Create</button>
          : <button onClick={() => savePost(tags)} className='ok'>Create</button>}
        </div>
      </div>
    </div>
  }
}
