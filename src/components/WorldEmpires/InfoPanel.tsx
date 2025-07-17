import React from 'react';
import './InfoPanel.css';

const InfoPanel = () => (
  <div className="card nicescroll-box info-section-v1 info-panel-white-bg">
    <div className="wrap">
      <div className="card-header">
        <h4>Empires In Prophecy</h4>
      </div>
      <div className="card-body">
        <ul className="nav nav-pills" id="myTab3" role="tablist">
          <li className="nav-item">
            <a className="nav-link" id="bibleTab" data-toggle="tab" href="#bible" role="tab" aria-controls="home" aria-selected="true"><i className="mdi mdi-bible"></i> Texts</a>
          </li>
          <li className="nav-item">
            <a className="nav-link active" id="profile-tab3" data-toggle="tab" href="#about" role="tab" aria-controls="profile" aria-selected="false"><i className="mdi mdi-information"></i> About</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" id="contact-tab3" data-toggle="tab" href="#settings" role="tab" aria-controls="contact" aria-selected="false"><i className="mdi mdi-cogs"></i> Settings</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" id="contact-tab3" data-toggle="tab" href="#instructions" role="tab" aria-controls="contact" aria-selected="false"><i className="mdi mdi-account-question"></i> How To</a>
          </li>
        </ul>
        <div className="tab-content" id="myTabContent2">
          <div className="tab-pane fade tabcontent" id="bible" role="tabpanel" aria-labelledby="home-tab3">
            <div id="Scriptures">
              <div id="showSubjects">
                <h6>Click on a verse <span>to see it here.</span></h6>
              </div>
              <div id="showTexts"></div>
              <div className="clear"></div>
            </div>
          </div>
          <div className="tab-pane fade show tabcontent active" id="about" role="tabpanel" aria-labelledby="profile-tab3">
            <div className="clear"></div>
            <h1><span className="fi55">Empires In Prophecy</span></h1>
            <h2 className="fi77">Studying Daniel and Revelation</h2>
            <div className="clear"></div>
            <p>When we couple the prophecies in Daniel and Revelation with the pattern of prophetic words throughout the bible, we can learn to interpret bible prophecy properly. To do this, we use the bible alone to interpret itself.</p><br/>
            <p>Biblical self interpretation has been the goal of this software since the beginning. So we can see a map of the interpretations.</p>
            <div className="quotecontent"><i className="mdi mdi-format-quote-open"></i><p className="text_justify fi12">"But know this first of all, that no prophecy of Scripture is a matter of one's own interpretation". </p></div>
            <div className="verse-container book fi10">2nd Peter <span>1:20</span></div>
            <div className="clear"></div>
            <p>I will write about the subject map soon (march 2019)</p><br/>
            <div className="clear"></div>
            <div className="or-spacer"><div className="spacer-mask2"></div></div>
            <div className="clear"></div>
          </div>
          <div className="tab-pane fade tabcontent" id="settings" role="tabpanel" aria-labelledby="contact-tab3">
            <table>
              <tbody>
                <tr>
                  <th>Text Size</th>
                  <th><input id="vision-text" min="6" max="16" defaultValue="8" step="1" type="range"/></th>
                </tr>
                <tr>
                  <th>Circle Size</th>
                  <th>
                    <button href="javascript:void(0);" id="minus" className="mdi mdi-minus"></button>
                    <button href="javascript:void(0);" id="plus" className="mdi mdi-plus"></button>
                  </th>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="tab-pane fade tabcontent" id="instructions" role="tabpanel" aria-labelledby="contact-tab3">
            <i className="mdi mdi-pan" style={{fontSize: '300%'}}></i>&nbsp;&nbsp;&nbsp; <i className="mdi mdi-gesture-pinch" style={{fontSize: '300%'}}></i><br/><br/>
            Pan and zoom to your hearts content. <br/>
            Use <i className="mdi mdi-cogs"></i> Settings to adjust radius and text size. <br/><br/><br/>
            <h5>These are Hierarchical Relationships</h5>
            <ul><li> <span style={{color: '#2aa3b1'}}>Blue Text</span> is the Selected Item</li>
              <ol>
                <li> <i style={{color:'#34e297',marginBottom:'-7px'}} className="mdi mdi-keyboard-tab"></i> <span style={{color:'#34e297'}}>Green</span> lines show what belongs to the <span style={{color: '#2aa3b1'}}>Selected Item</span>.</li>
                <ul><li><b>1a.</b> <span style={{color:'#34e297'}}>Green</span> lines &plus; <span style={{color:'red'}}>Red Items</span> show mutual ownership.</li></ul>
                <li> <i style={{color: '#34a2e2',marginBottom:'-7px'}} className="mdi mdi-keyboard-tab"></i> <span style={{color: '#34a2e2'}}>Blue</span> lines show what the <span style={{color: '#2aa3b1'}}>Selected Item</span> belongs to.</li>
              </ol>
            </ul><br/>
            <h6>Use the bible tab <i style={{color: '#00bcd4',marginTop: '-7px'}} className="mdi mdi-bible"></i> to see the texts.</h6>
            <br/>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default InfoPanel; 